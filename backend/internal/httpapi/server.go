package httpapi

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/ansarrnd/community-app/backend/internal/authjwt"
	"github.com/ansarrnd/community-app/backend/internal/config"
	"github.com/ansarrnd/community-app/backend/internal/domain"
	"github.com/ansarrnd/community-app/backend/internal/store"
)

type Server struct {
	store  *store.Store
	cfg    config.Config
	mux    *http.ServeMux
}

func New(st *store.Store, cfg config.Config) http.Handler {
	s := &Server{store: st, cfg: cfg, mux: http.NewServeMux()}
	s.routes()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if s.cfg.CORSOrigin != "" {
		w.Header().Set("Access-Control-Allow-Origin", s.cfg.CORSOrigin)
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
	}
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	s.mux.ServeHTTP(w, r)
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /health", s.health)
	s.mux.HandleFunc("POST /v1/auth/demo", s.authDemo)
	s.mux.HandleFunc("POST /v1/auth/login", s.authLogin)
	s.mux.HandleFunc("GET /v1/me", s.withAuth(s.me))
	s.mux.HandleFunc("GET /v1/events", s.withAuth(s.listEvents))
	s.mux.HandleFunc("GET /v1/events/pending", s.withAuth(s.pendingEvents))
	s.mux.HandleFunc("GET /v1/events/{id}", s.withAuth(s.getEvent))
	s.mux.HandleFunc("POST /v1/events", s.withAuth(s.createEvent))
	s.mux.HandleFunc("PATCH /v1/events/{id}/status", s.withAuth(s.patchStatus))
	s.mux.HandleFunc("POST /v1/events/{id}/rsvp", s.withAuth(s.rsvp))
	s.mux.HandleFunc("GET /v1/rsvps/me", s.withAuth(s.myRSVPs))
	s.mux.HandleFunc("GET /v1/users", s.withAuth(s.listUsers))
	s.mux.HandleFunc("GET /v1/users/{id}", s.withAuth(s.getUser))
	s.mux.HandleFunc("PATCH /v1/users/{id}/role", s.withAuth(s.grantRole))
	s.mux.HandleFunc("GET /e/{id}", s.sharePage)
	s.mux.HandleFunc("GET /v1/webhooks/whatsapp", s.whatsappVerify)
	s.mux.HandleFunc("POST /v1/webhooks/whatsapp", s.whatsappInbound)
}

type authedUser struct {
	UID  string
	Role domain.Role
}

func (s *Server) withAuth(next func(http.ResponseWriter, *http.Request, authedUser)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			writeErr(w, http.StatusUnauthorized, "unauthenticated", "missing bearer token")
			return
		}
		claims, err := authjwt.Parse(s.cfg.JWTSecret, strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			writeErr(w, http.StatusUnauthorized, "unauthenticated", "invalid token")
			return
		}
		next(w, r, authedUser{UID: claims.UID, Role: claims.Role})
	}
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) authDemo(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Role domain.Role `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	uid := map[domain.Role]string{
		domain.RoleUser:  "demo-user-resident",
		domain.RoleMod:   "demo-user-mod",
		domain.RoleAdmin: "demo-user-admin",
	}[body.Role]
	if uid == "" {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "role must be USER, MOD, or ADMIN")
		return
	}
	u, err := s.store.UserByUID(uid)
	if err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "demo user missing")
		return
	}
	s.issueSession(w, *u)
}

func (s *Server) authLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	u, hash, err := s.store.UserByEmail(body.Email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)) != nil {
		writeErr(w, http.StatusUnauthorized, "unauthenticated", "invalid credentials")
		return
	}
	s.issueSession(w, *u)
}

func (s *Server) issueSession(w http.ResponseWriter, u domain.User) {
	token, err := authjwt.Issue(s.cfg.JWTSecret, u, s.cfg.TokenTTL)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", "could not issue token")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": u})
}

func (s *Server) me(w http.ResponseWriter, _ *http.Request, au authedUser) {
	u, err := s.store.UserByUID(au.UID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "user not found")
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (s *Server) listEvents(w http.ResponseWriter, r *http.Request, _ authedUser) {
	q := r.URL.Query()
	limit := 20
	if v := q.Get("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	events, err := s.store.ListEvents(domain.StatusApproved, q.Get("category"), q.Get("q"), q.Get("cursor"), limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	var next *string
	if events == nil {
		events = []domain.Event{}
	}
	if len(events) > limit {
		id := events[limit-1].ID
		next = &id
		events = events[:limit]
	}
	writeJSON(w, http.StatusOK, domain.PaginatedEvents{Items: events, NextCursor: next})
}

func (s *Server) pendingEvents(w http.ResponseWriter, r *http.Request, au authedUser) {
	if !au.Role.AtLeast(domain.RoleMod) {
		writeErr(w, http.StatusForbidden, "permission-denied", "moderator required")
		return
	}
	events, err := s.store.ListEvents(domain.StatusPending, "", "", "", 200)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, events)
}

func (s *Server) getEvent(w http.ResponseWriter, r *http.Request, au authedUser) {
	e, err := s.store.EventByID(r.PathValue("id"))
	if err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "event not found")
		return
	}
	if e.Status != domain.StatusApproved && au.UID != e.OrganizerID && !au.Role.AtLeast(domain.RoleMod) {
		writeErr(w, http.StatusForbidden, "permission-denied", "not visible")
		return
	}
	writeJSON(w, http.StatusOK, e)
}

func (s *Server) createEvent(w http.ResponseWriter, r *http.Request, au authedUser) {
	var in domain.CreateEventInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	if len(in.Title) < 3 || len(in.Venue) < 3 || len(in.Details) < 10 {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "title, venue, and details are required")
		return
	}
	in.OrganizerID = au.UID
	if in.OrganizerName == "" {
		if u, err := s.store.UserByUID(au.UID); err == nil {
			in.OrganizerName = u.DisplayName
		}
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	e := domain.Event{
		CreateEventInput: in,
		ID:               "evt-" + randomID(),
		Status:           domain.StatusPending,
		Version:          1,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
	if au.Role.AtLeast(domain.RoleMod) {
		e.Status = domain.StatusApproved
		e.ModeratedBy = au.UID
	}
	if err := s.store.InsertEvent(e); err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, e)
}

func (s *Server) patchStatus(w http.ResponseWriter, r *http.Request, au authedUser) {
	if !au.Role.AtLeast(domain.RoleMod) {
		writeErr(w, http.StatusForbidden, "permission-denied", "moderator required")
		return
	}
	var body struct {
		Status domain.EventStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	if body.Status != domain.StatusApproved && body.Status != domain.StatusRejected && body.Status != domain.StatusPending {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid status")
		return
	}
	if err := s.store.UpdateEventStatus(r.PathValue("id"), body.Status, au.UID); err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "event not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *Server) rsvp(w http.ResponseWriter, r *http.Request, au authedUser) {
	var body struct {
		Status domain.RSVPStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	if body.Status != domain.RSVPAttending && body.Status != domain.RSVPDeclined {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "status must be ATTENDING or DECLINED")
		return
	}
	rsvp, err := s.store.UpsertRSVP(r.PathValue("id"), au.UID, body.Status)
	if errors.Is(err, sql.ErrNoRows) {
		writeErr(w, http.StatusNotFound, "not-found", "event not found")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, rsvp)
}

func (s *Server) myRSVPs(w http.ResponseWriter, _ *http.Request, au authedUser) {
	m, err := s.store.UserRSVPs(au.UID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, m)
}

func (s *Server) listUsers(w http.ResponseWriter, _ *http.Request, au authedUser) {
	if !au.Role.AtLeast(domain.RoleMod) {
		writeErr(w, http.StatusForbidden, "permission-denied", "moderator required")
		return
	}
	users, err := s.store.AllUsers()
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "internal", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, users)
}

func (s *Server) getUser(w http.ResponseWriter, r *http.Request, _ authedUser) {
	u, err := s.store.UserByUID(r.PathValue("id"))
	if err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "user not found")
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (s *Server) grantRole(w http.ResponseWriter, r *http.Request, au authedUser) {
	if au.Role != domain.RoleAdmin {
		writeErr(w, http.StatusForbidden, "permission-denied", "admin required")
		return
	}
	target := r.PathValue("id")
	if target == au.UID {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "cannot change own role")
		return
	}
	var body struct {
		Role domain.Role `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid json")
		return
	}
	if body.Role != domain.RoleUser && body.Role != domain.RoleMod && body.Role != domain.RoleAdmin {
		writeErr(w, http.StatusBadRequest, "invalid-argument", "invalid role")
		return
	}
	if err := s.store.UpdateRole(target, body.Role); err != nil {
		writeErr(w, http.StatusNotFound, "not-found", "user not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "uid": target, "role": body.Role})
}

func (s *Server) sharePage(w http.ResponseWriter, r *http.Request) {
	e, err := s.store.EventByID(r.PathValue("id"))
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	host := strings.TrimRight(s.cfg.PublicShareHost, "/")
	url := host + "/e/" + e.ID
	title := html.EscapeString(e.Title)
	desc := html.EscapeString(e.Details)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=300")
	fmt.Fprintf(w, `<!doctype html><html><head>
<meta charset="utf-8"/>
<title>%s</title>
<meta property="og:title" content="%s"/>
<meta property="og:description" content="%s"/>
<meta property="og:url" content="%s"/>
<meta name="twitter:card" content="summary"/>
</head><body><h1>%s</h1><p>%s</p><p>%s · %s · %s</p></body></html>`,
		title, title, desc, html.EscapeString(url), title, desc,
		html.EscapeString(e.Venue), html.EscapeString(e.Date), html.EscapeString(e.Time))
}

func (s *Server) whatsappVerify(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	if q.Get("hub.mode") == "subscribe" && q.Get("hub.verify_token") == s.cfg.WhatsAppVerify {
		_, _ = io.WriteString(w, q.Get("hub.challenge"))
		return
	}
	http.Error(w, "forbidden", http.StatusForbidden)
}

func (s *Server) whatsappInbound(w http.ResponseWriter, r *http.Request) {
	var payload map[string]any
	_ = json.NewDecoder(r.Body).Decode(&payload)
	if obj, _ := payload["object"].(string); obj == "whatsapp_business_account" {
		entries, _ := payload["entry"].([]any)
		for _, entry := range entries {
			em, _ := entry.(map[string]any)
			changes, _ := em["changes"].([]any)
			for _, ch := range changes {
				cm, _ := ch.(map[string]any)
				value, _ := cm["value"].(map[string]any)
				if msgs, ok := value["messages"].([]any); ok {
					for _, m := range msgs {
						mm, _ := m.(map[string]any)
						from, _ := mm["from"].(string)
						textObj, _ := mm["text"].(map[string]any)
						body, _ := textObj["body"].(string)
						_ = s.store.InsertWhatsAppInbound(from, body)
					}
				}
				if sts, ok := value["statuses"].([]any); ok {
					for _, st := range sts {
						sm, _ := st.(map[string]any)
						id, _ := sm["id"].(string)
						status, _ := sm["status"].(string)
						_ = s.store.UpsertWhatsAppStatus(id, status)
					}
				}
			}
		}
	}
	_, _ = io.WriteString(w, "EVENT_RECEIVED")
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, code, msg string) {
	writeJSON(w, status, map[string]string{"code": code, "error": msg})
}

func randomID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
