package main

import (
	"log"
	"net/http"

	"github.com/ansarrnd/community-app/backend/internal/config"
	"github.com/ansarrnd/community-app/backend/internal/httpapi"
	"github.com/ansarrnd/community-app/backend/internal/seed"
	"github.com/ansarrnd/community-app/backend/internal/store"
)

func main() {
	cfg := config.FromEnv()
	st, err := store.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer st.Close()
	if err := seed.Demo(st); err != nil {
		log.Fatal(err)
	}
	log.Printf("community-connect go api listening on http://%s", cfg.Addr)
	if err := http.ListenAndServe(cfg.Addr, httpapi.New(st, cfg)); err != nil {
		log.Fatal(err)
	}
}
