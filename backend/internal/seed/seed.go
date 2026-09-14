package seed

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/ansarrnd/community-app/backend/internal/domain"
	"github.com/ansarrnd/community-app/backend/internal/store"
)

const DemoPassword = "DemoPass123!"

type demoUser struct {
	UID, Email, DisplayName, Phone string
	Role                           domain.Role
}

var DemoUsers = []demoUser{
	{"demo-user-resident", "resident@demo.community", "Alex Mercer", "+15550192834", domain.RoleUser},
	{"demo-user-mod", "mod@demo.community", "Maya Moderator", "+15550192835", domain.RoleMod},
	{"demo-user-admin", "admin@demo.community", "Arun Administrator", "+15550192836", domain.RoleAdmin},
}

func Demo(st *store.Store) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(DemoPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	for _, d := range DemoUsers {
		u := domain.User{
			UID: d.UID, Email: d.Email, PhoneNumber: d.Phone,
			DisplayName: d.DisplayName, Role: d.Role, CreatedAt: time.Now().UTC().Format(time.RFC3339),
		}
		if err := st.UpsertUser(u, d.Email, string(hash)); err != nil {
			return err
		}
	}

	if existing, _ := st.EventByID("evt-go-1"); existing == nil {
		now := time.Now().UTC().Format(time.RFC3339)
		e := domain.Event{
			CreateEventInput: domain.CreateEventInput{
				Title: "Harvest feast at the community hall", Category: domain.CategoryCultural,
				Date: "2026-09-20", Time: "18:00", Venue: "Community Hall",
				Details: "Bring a dish to share. Open to all approved residents.",
				OrganizerID: "demo-user-resident", OrganizerName: "Alex Mercer",
			},
			ID: "evt-go-1", Status: domain.StatusApproved,
			RSVPCount: 12, AttendingCount: 10, DeclinedCount: 2, Version: 1,
			CreatedAt: now, UpdatedAt: now,
		}
		if err := st.InsertEvent(e); err != nil {
			return err
		}
		pending := domain.Event{
			CreateEventInput: domain.CreateEventInput{
				Title: "Village sports day", Category: domain.CategoryMeeting,
				Date: "2026-10-04", Time: "09:00", Venue: "School ground",
				Details: "Awaiting moderator approval for the sports day schedule.",
				OrganizerID: "demo-user-resident", OrganizerName: "Alex Mercer",
			},
			ID: "evt-go-2", Status: domain.StatusPending, Version: 1,
			CreatedAt: now, UpdatedAt: now,
		}
		if err := st.InsertEvent(pending); err != nil {
			return err
		}
	}
	log.Printf("seeded demo users (password %s) and sample events", DemoPassword)
	return nil
}
