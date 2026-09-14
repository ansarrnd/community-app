package httpapi_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"github.com/ansarrnd/community-app/backend/internal/config"
	"github.com/ansarrnd/community-app/backend/internal/httpapi"
	"github.com/ansarrnd/community-app/backend/internal/seed"
	"github.com/ansarrnd/community-app/backend/internal/store"
)

func testServer(t *testing.T) *httptest.Server {
	t.Helper()
	dsn := "file:" + filepath.Join(t.TempDir(), "t.db") + "?_pragma=foreign_keys(1)"
	st, err := store.Open(dsn)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = st.Close() })
	if err := seed.Demo(st); err != nil {
		t.Fatal(err)
	}
	cfg := config.Config{
		JWTSecret:       []byte("test-secret"),
		TokenTTL:        time.Hour,
		PublicShareHost: "http://example.test",
		WhatsAppVerify:  "verify-me",
		CORSOrigin:      "*",
	}
	return httptest.NewServer(httpapi.New(st, cfg))
}

func login(t *testing.T, srv *httptest.Server, role string) (token string, client *http.Client) {
	t.Helper()
	body, _ := json.Marshal(map[string]string{"role": role})
	resp, err := http.Post(srv.URL+"/v1/auth/demo", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		t.Fatalf("demo login %s: %d %s", role, resp.StatusCode, b)
	}
	var out struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	return out.Token, srv.Client()
}

func doJSON(t *testing.T, client *http.Client, method, url, token string, payload any) *http.Response {
	t.Helper()
	var r io.Reader
	if payload != nil {
		b, _ := json.Marshal(payload)
		r = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, url, r)
	if err != nil {
		t.Fatal(err)
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	return resp
}

func TestHealthAndAuth(t *testing.T) {
	srv := testServer(t)
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/health")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("health %d", resp.StatusCode)
	}

	token, client := login(t, srv, "USER")
	me := doJSON(t, client, "GET", srv.URL+"/v1/me", token, nil)
	defer me.Body.Close()
	if me.StatusCode != 200 {
		t.Fatalf("me %d", me.StatusCode)
	}
	var user map[string]any
	_ = json.NewDecoder(me.Body).Decode(&user)
	if user["role"] != "USER" {
		t.Fatalf("expected USER, got %#v", user["role"])
	}

	bad := doJSON(t, client, "GET", srv.URL+"/v1/me", "nope", nil)
	bad.Body.Close()
	if bad.StatusCode != 401 {
		t.Fatalf("expected 401, got %d", bad.StatusCode)
	}
}

func TestEventLifecycleRSVPAndModeration(t *testing.T) {
	srv := testServer(t)
	defer srv.Close()

	userTok, client := login(t, srv, "USER")
	create := doJSON(t, client, "POST", srv.URL+"/v1/events", userTok, map[string]any{
		"title": "Street cricket night", "category": "MEETING",
		"date": "2026-11-01", "time": "19:00", "venue": "North courtyard",
		"details": "Bring bats. Neighbours welcome after work.",
	})
	defer create.Body.Close()
	if create.StatusCode != 201 {
		b, _ := io.ReadAll(create.Body)
		t.Fatalf("create %d %s", create.StatusCode, b)
	}
	var created struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}
	_ = json.NewDecoder(create.Body).Decode(&created)
	if created.Status != "PENDING" {
		t.Fatalf("user create should be PENDING, got %s", created.Status)
	}

	feed := doJSON(t, client, "GET", srv.URL+"/v1/events", userTok, nil)
	defer feed.Body.Close()
	var page struct {
		Items []struct {
			ID string `json:"id"`
		} `json:"items"`
	}
	_ = json.NewDecoder(feed.Body).Decode(&page)
	for _, it := range page.Items {
		if it.ID == created.ID {
			t.Fatal("pending event leaked into approved feed")
		}
	}

	modTok, _ := login(t, srv, "MOD")
	pending := doJSON(t, client, "GET", srv.URL+"/v1/events/pending", modTok, nil)
	pending.Body.Close()
	if pending.StatusCode != 200 {
		t.Fatalf("pending as mod %d", pending.StatusCode)
	}
	asUser := doJSON(t, client, "GET", srv.URL+"/v1/events/pending", userTok, nil)
	asUser.Body.Close()
	if asUser.StatusCode != 403 {
		t.Fatalf("pending as user should 403, got %d", asUser.StatusCode)
	}

	approve := doJSON(t, client, "PATCH", srv.URL+"/v1/events/"+created.ID+"/status", modTok, map[string]string{"status": "APPROVED"})
	approve.Body.Close()
	if approve.StatusCode != 200 {
		t.Fatalf("approve %d", approve.StatusCode)
	}

	rsvp := doJSON(t, client, "POST", srv.URL+"/v1/events/"+created.ID+"/rsvp", userTok, map[string]string{"status": "ATTENDING"})
	defer rsvp.Body.Close()
	if rsvp.StatusCode != 200 {
		b, _ := io.ReadAll(rsvp.Body)
		t.Fatalf("rsvp %d %s", rsvp.StatusCode, b)
	}
	flip := doJSON(t, client, "POST", srv.URL+"/v1/events/"+created.ID+"/rsvp", userTok, map[string]string{"status": "DECLINED"})
	flip.Body.Close()

	got := doJSON(t, client, "GET", srv.URL+"/v1/events/"+created.ID, userTok, nil)
	defer got.Body.Close()
	var ev struct {
		RSVPCount      int `json:"rsvpCount"`
		AttendingCount int `json:"attendingCount"`
		DeclinedCount  int `json:"declinedCount"`
	}
	_ = json.NewDecoder(got.Body).Decode(&ev)
	if ev.RSVPCount != 1 || ev.DeclinedCount != 1 || ev.AttendingCount != 0 {
		t.Fatalf("counts after flip: %+v", ev)
	}
}

func TestGrantRoleAdminOnly(t *testing.T) {
	srv := testServer(t)
	defer srv.Close()
	client := srv.Client()

	userTok, _ := login(t, srv, "USER")
	denied := doJSON(t, client, "PATCH", srv.URL+"/v1/users/demo-user-resident/role", userTok, map[string]string{"role": "MOD"})
	denied.Body.Close()
	if denied.StatusCode != 403 {
		t.Fatalf("user grant %d", denied.StatusCode)
	}

	adminTok, _ := login(t, srv, "ADMIN")
	self := doJSON(t, client, "PATCH", srv.URL+"/v1/users/demo-user-admin/role", adminTok, map[string]string{"role": "USER"})
	self.Body.Close()
	if self.StatusCode != 400 {
		t.Fatalf("self demote %d", self.StatusCode)
	}

	ok := doJSON(t, client, "PATCH", srv.URL+"/v1/users/demo-user-resident/role", adminTok, map[string]string{"role": "MOD"})
	defer ok.Body.Close()
	if ok.StatusCode != 200 {
		b, _ := io.ReadAll(ok.Body)
		t.Fatalf("admin grant %d %s", ok.StatusCode, b)
	}
}

func TestSharePageAndWhatsAppWebhook(t *testing.T) {
	srv := testServer(t)
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/e/evt-go-1")
	if err != nil {
		t.Fatal(err)
	}
	b, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if resp.StatusCode != 200 || !bytes.Contains(b, []byte("og:title")) {
		t.Fatalf("share page %d %s", resp.StatusCode, b)
	}

	verify, err := http.Get(srv.URL + "/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=abc")
	if err != nil {
		t.Fatal(err)
	}
	ch, _ := io.ReadAll(verify.Body)
	verify.Body.Close()
	if string(ch) != "abc" {
		t.Fatalf("challenge %s", ch)
	}

	payload := map[string]any{
		"object": "whatsapp_business_account",
		"entry": []any{map[string]any{"changes": []any{map[string]any{"value": map[string]any{
			"messages": []any{map[string]any{"from": "1555", "text": map[string]any{"body": "hello"}}},
			"statuses": []any{map[string]any{"id": "wamid.1", "status": "delivered"}},
		}}}}},
	}
	post := doJSON(t, srv.Client(), "POST", srv.URL+"/v1/webhooks/whatsapp", "", payload)
	defer post.Body.Close()
	body, _ := io.ReadAll(post.Body)
	if string(body) != "EVENT_RECEIVED" {
		t.Fatalf("webhook %s", body)
	}
}

func TestPasswordLogin(t *testing.T) {
	srv := testServer(t)
	defer srv.Close()
	resp := doJSON(t, srv.Client(), "POST", srv.URL+"/v1/auth/login", "", map[string]string{
		"email": "mod@demo.community", "password": seed.DemoPassword,
	})
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		t.Fatalf("login %d %s", resp.StatusCode, b)
	}
}
