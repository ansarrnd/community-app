package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ansarrnd/community-app/backend/internal/domain"
	_ "modernc.org/sqlite"
)

type Store struct {
	DB *sql.DB
}

func Open(dsn string) (*Store, error) {
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	s := &Store{DB: db}
	if err := s.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return s, nil
}

func (s *Store) Close() error {
	return s.DB.Close()
}

func (s *Store) migrate() error {
	_, err := s.DB.Exec(`
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT,
  invite_card_url TEXT,
  organizer_id TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  groom_name TEXT,
  bride_name TEXT,
  agenda TEXT,
  attached_members TEXT,
  attached_relationships TEXT,
  rsvp_count INTEGER NOT NULL DEFAULT 0,
  attending_count INTEGER NOT NULL DEFAULT 0,
  declined_count INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  moderated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  UNIQUE(event_id, user_id)
);
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  source_person_id TEXT NOT NULL,
  target_person_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  context_tag TEXT NOT NULL DEFAULT 'In-Village',
  lineage_category TEXT NOT NULL DEFAULT 'GENERAL',
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS whatsapp_inbound (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_phone TEXT,
  body TEXT,
  received_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS whatsapp_statuses (
  message_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_status_created ON events(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_cat_created ON events(status, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON rsvps(user_id);
`)
	return err
}

func nowRFC3339() string {
	return time.Now().UTC().Format(time.RFC3339Nano)
}

func (s *Store) UpsertUser(u domain.User, email, passwordHash string) error {
	if u.CreatedAt == "" {
		u.CreatedAt = nowRFC3339()
	}
	_, err := s.DB.Exec(`
INSERT INTO users (uid, email, password_hash, phone_number, display_name, role, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(uid) DO UPDATE SET
  email=excluded.email,
  password_hash=excluded.password_hash,
  phone_number=excluded.phone_number,
  display_name=excluded.display_name,
  role=excluded.role
`, u.UID, email, passwordHash, u.PhoneNumber, u.DisplayName, string(u.Role), u.CreatedAt)
	return err
}

func (s *Store) UserByUID(uid string) (*domain.User, error) {
	return s.scanUser(`SELECT uid, email, phone_number, display_name, role, created_at FROM users WHERE uid = ?`, uid)
}

func (s *Store) UserByEmail(email string) (*domain.User, string, error) {
	row := s.DB.QueryRow(`SELECT uid, email, phone_number, display_name, role, created_at, password_hash FROM users WHERE email = ?`, email)
	var u domain.User
	var hash string
	if err := row.Scan(&u.UID, &u.Email, &u.PhoneNumber, &u.DisplayName, &u.Role, &u.CreatedAt, &hash); err != nil {
		return nil, "", err
	}
	return &u, hash, nil
}

func (s *Store) AllUsers() ([]domain.User, error) {
	rows, err := s.DB.Query(`SELECT uid, email, phone_number, display_name, role, created_at FROM users ORDER BY created_at`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.UID, &u.Email, &u.PhoneNumber, &u.DisplayName, &u.Role, &u.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, rows.Err()
}

func (s *Store) UpdateRole(uid string, role domain.Role) error {
	res, err := s.DB.Exec(`UPDATE users SET role = ? WHERE uid = ?`, string(role), uid)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *Store) scanUser(q string, args ...any) (*domain.User, error) {
	var u domain.User
	err := s.DB.QueryRow(q, args...).Scan(&u.UID, &u.Email, &u.PhoneNumber, &u.DisplayName, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) InsertEvent(e domain.Event) error {
	members, _ := json.Marshal(e.AttachedMembers)
	rels, _ := json.Marshal(e.AttachedRelationships)
	_, err := s.DB.Exec(`
INSERT INTO events (
  id, title, category, date, time, venue, details, google_maps_url, invite_card_url,
  organizer_id, organizer_name, status, groom_name, bride_name, agenda,
  attached_members, attached_relationships, rsvp_count, attending_count, declined_count,
  version, moderated_by, created_at, updated_at
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		e.ID, e.Title, string(e.Category), e.Date, e.Time, e.Venue, e.Details, nullStr(e.GoogleMapsURL),
		nullStr(e.InviteCardURL), e.OrganizerID, e.OrganizerName, string(e.Status), nullStr(e.GroomName),
		nullStr(e.BrideName), nullStr(e.Agenda), string(members), string(rels), e.RSVPCount, e.AttendingCount,
		e.DeclinedCount, e.Version, nullStr(e.ModeratedBy), e.CreatedAt, e.UpdatedAt)
	return err
}

func (s *Store) EventByID(id string) (*domain.Event, error) {
	row := s.DB.QueryRow(`SELECT `+eventColumns+` FROM events WHERE id = ?`, id)
	e, err := scanEvent(row)
	if err != nil {
		return nil, err
	}
	return e, nil
}

const eventColumns = `id, title, category, date, time, venue, details, google_maps_url, invite_card_url,
  organizer_id, organizer_name, status, groom_name, bride_name, agenda,
  attached_members, attached_relationships, rsvp_count, attending_count, declined_count,
  version, moderated_by, created_at, updated_at`

type scanner interface {
	Scan(dest ...any) error
}

func scanEvent(row scanner) (*domain.Event, error) {
	var e domain.Event
	var maps, invite, groom, bride, agenda, members, rels, mod sql.NullString
	err := row.Scan(
		&e.ID, &e.Title, &e.Category, &e.Date, &e.Time, &e.Venue, &e.Details, &maps, &invite,
		&e.OrganizerID, &e.OrganizerName, &e.Status, &groom, &bride, &agenda,
		&members, &rels, &e.RSVPCount, &e.AttendingCount, &e.DeclinedCount,
		&e.Version, &mod, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	e.GoogleMapsURL = maps.String
	e.InviteCardURL = invite.String
	e.GroomName = groom.String
	e.BrideName = bride.String
	e.Agenda = agenda.String
	e.ModeratedBy = mod.String
	if members.Valid && members.String != "" && members.String != "null" {
		_ = json.Unmarshal([]byte(members.String), &e.AttachedMembers)
	}
	if rels.Valid && rels.String != "" && rels.String != "null" {
		_ = json.Unmarshal([]byte(rels.String), &e.AttachedRelationships)
	}
	return &e, nil
}

func (s *Store) ListEvents(status domain.EventStatus, category string, search string, cursor string, limit int) ([]domain.Event, error) {
	if limit <= 0 {
		limit = 20
	}
	args := []any{string(status)}
	q := `SELECT ` + eventColumns + ` FROM events WHERE status = ?`
	if category != "" && category != "ALL" {
		q += ` AND category = ?`
		args = append(args, category)
	}
	if cursor != "" {
		q += ` AND (created_at, id) < ((SELECT created_at FROM events WHERE id = ?), ?)`
		args = append(args, cursor, cursor)
	}
	q += ` ORDER BY created_at DESC, id DESC LIMIT ?`
	args = append(args, limit+1)

	rows, err := s.DB.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var events []domain.Event
	for rows.Next() {
		e, err := scanEvent(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, *e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if search = strings.TrimSpace(strings.ToLower(search)); search != "" {
		filtered := events[:0]
		for _, e := range events {
			if strings.Contains(strings.ToLower(e.Title), search) || strings.Contains(strings.ToLower(e.Venue), search) {
				filtered = append(filtered, e)
			}
		}
		events = filtered
	}
	return events, nil
}

func (s *Store) UpdateEventStatus(id string, status domain.EventStatus, moderatorID string) error {
	res, err := s.DB.Exec(`UPDATE events SET status = ?, moderated_by = ?, updated_at = ? WHERE id = ?`,
		string(status), moderatorID, nowRFC3339(), id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *Store) UpsertRSVP(eventID, userID string, status domain.RSVPStatus) (*domain.RSVP, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback() }()

	var rsvpCount, attending, declined int
	err = tx.QueryRow(`SELECT rsvp_count, attending_count, declined_count FROM events WHERE id = ?`, eventID).
		Scan(&rsvpCount, &attending, &declined)
	if err != nil {
		return nil, err
	}

	var prev sql.NullString
	var existingTS sql.NullString
	err = tx.QueryRow(`SELECT status, timestamp FROM rsvps WHERE event_id = ? AND user_id = ?`, eventID, userID).
		Scan(&prev, &existingTS)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	switch {
	case !prev.Valid:
		rsvpCount++
		if status == domain.RSVPAttending {
			attending++
		} else {
			declined++
		}
	case prev.String != string(status):
		if status == domain.RSVPAttending {
			attending++
			if declined > 0 {
				declined--
			}
		} else {
			declined++
			if attending > 0 {
				attending--
			}
		}
	}

	ts := nowRFC3339()
	if existingTS.Valid {
		ts = existingTS.String
	}
	id := eventID + "_" + userID
	_, err = tx.Exec(`
INSERT INTO rsvps (id, event_id, user_id, status, timestamp) VALUES (?, ?, ?, ?, ?)
ON CONFLICT(event_id, user_id) DO UPDATE SET status = excluded.status
`, id, eventID, userID, string(status), ts)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(`UPDATE events SET rsvp_count=?, attending_count=?, declined_count=?, updated_at=? WHERE id=?`,
		rsvpCount, attending, declined, nowRFC3339(), eventID)
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &domain.RSVP{ID: id, EventID: eventID, UserID: userID, Status: status, Timestamp: ts}, nil
}

func (s *Store) UserRSVPs(userID string) (map[string]domain.RSVPStatus, error) {
	rows, err := s.DB.Query(`SELECT event_id, status FROM rsvps WHERE user_id = ?`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]domain.RSVPStatus{}
	for rows.Next() {
		var eventID, status string
		if err := rows.Scan(&eventID, &status); err != nil {
			return nil, err
		}
		out[eventID] = domain.RSVPStatus(status)
	}
	return out, rows.Err()
}

func (s *Store) PutJSON(table, id string, payload any) error {
	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	q := fmt.Sprintf(`INSERT INTO %s (id, payload, updated_at) VALUES (?, ?, ?)
ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at`, table)
	_, err = s.DB.Exec(q, id, string(b), nowRFC3339())
	return err
}

func (s *Store) GetPerson(id string) (*domain.Person, error) {
	var payload string
	if err := s.DB.QueryRow(`SELECT payload FROM persons WHERE id = ?`, id).Scan(&payload); err != nil {
		return nil, err
	}
	var p domain.Person
	if err := json.Unmarshal([]byte(payload), &p); err != nil {
		return nil, err
	}
	p.ID = id
	return &p, nil
}

func (s *Store) PutRelationship(r domain.Relationship) error {
	b, err := json.Marshal(r)
	if err != nil {
		return err
	}
	active := 0
	if r.IsActive {
		active = 1
	}
	_, err = s.DB.Exec(`
INSERT INTO relationships (id, source_person_id, target_person_id, payload, is_active, context_tag, lineage_category, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, is_active=excluded.is_active,
  context_tag=excluded.context_tag, lineage_category=excluded.lineage_category, updated_at=excluded.updated_at
`, r.ID, r.SourcePersonID, r.TargetPersonID, string(b), active, r.ContextTag, r.LineageCategory, nowRFC3339())
	return err
}

func (s *Store) RelationshipsForPerson(personID string, outVillageOnly bool, lineage string, contextTag string) ([]domain.Relationship, error) {
	q := `SELECT payload FROM relationships WHERE is_active = 1 AND (source_person_id = ? OR target_person_id = ?)`
	args := []any{personID, personID}
	if outVillageOnly {
		q += ` AND context_tag = 'Out-Village'`
	}
	if lineage != "" {
		q += ` AND lineage_category = ?`
		args = append(args, lineage)
	}
	if contextTag != "" {
		q += ` AND context_tag = ?`
		args = append(args, contextTag)
	}
	rows, err := s.DB.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.Relationship
	for rows.Next() {
		var payload string
		if err := rows.Scan(&payload); err != nil {
			return nil, err
		}
		var r domain.Relationship
		if err := json.Unmarshal([]byte(payload), &r); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func (s *Store) InsertWhatsAppInbound(from, body string) error {
	_, err := s.DB.Exec(`INSERT INTO whatsapp_inbound (from_phone, body, received_at) VALUES (?, ?, ?)`, from, body, nowRFC3339())
	return err
}

func (s *Store) UpsertWhatsAppStatus(messageID, status string) error {
	_, err := s.DB.Exec(`
INSERT INTO whatsapp_statuses (message_id, status, updated_at) VALUES (?, ?, ?)
ON CONFLICT(message_id) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at
`, messageID, status, nowRFC3339())
	return err
}

func nullStr(v string) any {
	if v == "" {
		return nil
	}
	return v
}
