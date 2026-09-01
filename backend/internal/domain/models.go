package domain

type Role string

const (
	RoleUser  Role = "USER"
	RoleMod   Role = "MOD"
	RoleAdmin Role = "ADMIN"
)

func (r Role) Rank() int {
	switch r {
	case RoleAdmin:
		return 3
	case RoleMod:
		return 2
	default:
		return 1
	}
}

func (r Role) AtLeast(required Role) bool {
	return r.Rank() >= required.Rank()
}

type User struct {
	UID         string `json:"uid"`
	Email       string `json:"email,omitempty"`
	PhoneNumber string `json:"phoneNumber"`
	DisplayName string `json:"displayName"`
	Role        Role   `json:"role"`
	CreatedAt   string `json:"createdAt,omitempty"`
}

type EventCategory string
type EventStatus string
type RSVPStatus string

const (
	CategoryMarriage EventCategory = "MARRIAGE"
	CategoryCultural EventCategory = "CULTURAL"
	CategoryMeeting  EventCategory = "MEETING"

	StatusPending  EventStatus = "PENDING"
	StatusApproved EventStatus = "APPROVED"
	StatusRejected EventStatus = "REJECTED"

	RSVPAttending RSVPStatus = "ATTENDING"
	RSVPDeclined  RSVPStatus = "DECLINED"
)

type CreateEventInput struct {
	Title                  string           `json:"title"`
	Category               EventCategory    `json:"category"`
	Date                   string           `json:"date"`
	Time                   string           `json:"time"`
	Venue                  string           `json:"venue"`
	GoogleMapsURL          string           `json:"googleMapsUrl,omitempty"`
	Details                string           `json:"details"`
	InviteCardURL          string           `json:"inviteCardUrl,omitempty"`
	OrganizerID            string           `json:"organizerId"`
	OrganizerName          string           `json:"organizerName,omitempty"`
	GroomName              string           `json:"groomName,omitempty"`
	BrideName              string           `json:"brideName,omitempty"`
	Agenda                 string           `json:"agenda,omitempty"`
	AttachedMembers        []map[string]any `json:"attachedMembers,omitempty"`
	AttachedRelationships  []map[string]any `json:"attachedRelationships,omitempty"`
}

type Event struct {
	CreateEventInput
	ID             string      `json:"id"`
	Status         EventStatus `json:"status"`
	RSVPCount      int         `json:"rsvpCount"`
	AttendingCount int         `json:"attendingCount"`
	DeclinedCount  int         `json:"declinedCount"`
	Version        int         `json:"version"`
	ModeratedBy    string      `json:"moderatedBy,omitempty"`
	CreatedAt      string      `json:"createdAt,omitempty"`
	UpdatedAt      string      `json:"updatedAt,omitempty"`
}

type RSVP struct {
	ID        string     `json:"id"`
	EventID   string     `json:"eventId"`
	UserID    string     `json:"userId"`
	Status    RSVPStatus `json:"status"`
	Timestamp string     `json:"timestamp"`
}

type PaginatedEvents struct {
	Items      []Event `json:"items"`
	NextCursor *string `json:"nextCursor"`
}

type Person struct {
	ID                 string `json:"id"`
	FullName           string `json:"fullName"`
	Gender             string `json:"gender"`
	BirthYear          *int   `json:"birthYear,omitempty"`
	HomeVillageID      string `json:"homeVillageId,omitempty"`
	CurrentLocationTag string `json:"currentLocationTag"`
	Phone              string `json:"phone,omitempty"`
	Notes              string `json:"notes,omitempty"`
}

type Village struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	District      string `json:"district,omitempty"`
	State         string `json:"state,omitempty"`
	IsHomeVillage bool   `json:"isHomeVillage"`
}

type Relationship struct {
	ID               string `json:"id"`
	SourcePersonID   string `json:"sourcePersonId"`
	TargetPersonID   string `json:"targetPersonId"`
	RelationshipType string `json:"relationshipType"`
	InverseType      string `json:"inverseType"`
	LineageCategory  string `json:"lineageCategory"`
	ContextTag       string `json:"contextTag"`
	IsActive         bool   `json:"isActive"`
}
