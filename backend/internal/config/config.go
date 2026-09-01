package config

import (
	"os"
	"time"
)

type Config struct {
	Addr            string
	DatabaseURL     string
	JWTSecret       []byte
	TokenTTL        time.Duration
	PublicShareHost string
	WhatsAppVerify  string
	CORSOrigin      string
}

func FromEnv() Config {
	secret := getenv("JWT_SECRET", "dev-only-change-me")
	return Config{
		Addr:            getenv("HTTP_ADDR", "127.0.0.1:8088"),
		DatabaseURL:     getenv("DATABASE_URL", "file:community.db?_pragma=busy_timeout(5000)&_pragma=foreign_keys(1)"),
		JWTSecret:       []byte(secret),
		TokenTTL:        7 * 24 * time.Hour,
		PublicShareHost: getenv("PUBLIC_SHARE_HOST", "http://127.0.0.1:8088"),
		WhatsAppVerify:  getenv("META_WA_VERIFY_TOKEN", "community-connect-verify-token"),
		CORSOrigin:      getenv("CORS_ORIGIN", "*"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
