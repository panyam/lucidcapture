package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	goal "github.com/panyam/goapplib"
	gotl "github.com/panyam/goutils/template"
	tmplr "github.com/panyam/templar"
	"github.com/panyam/lucidcapture/services/gormbe"
	"github.com/panyam/lucidcapture/views"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Storage backend — selected via LC_STORAGE env var
	// "gorm" (default for local dev), "datastore" (App Engine), "" (IndexedDB only)
	lucidApp := &views.LucidApp{}

	storageBE := envOr("LC_STORAGE", "")
	switch storageBE {
	case "gorm":
		dbPath := envOr("LC_DB_PATH", "./lucidcapture.db")
		db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			log.Fatalf("Failed to open database: %v", err)
		}
		lucidApp.Store = gormbe.NewStore(db)
		log.Printf("Storage: GORM (SQLite: %s)", dbPath)
	case "datastore":
		// TODO: wire datastore backend
		log.Println("Storage: Datastore (not implemented yet — falling back to IndexedDB only)")
	default:
		log.Println("Storage: none (IndexedDB only)")
	}

	// Templates — use Templar source loader with templar.yaml for @goapplib resolution
	templatesDir := envOr("LC_TEMPLATES_DIR", "./templates")
	templates := tmplr.NewTemplateGroup()
	sourceLoader, err := tmplr.NewSourceLoaderFromDir(templatesDir)
	if err != nil {
		log.Printf("WARN: No templar.yaml found, falling back to simple loader: %v", err)
		templates.Loader = tmplr.NewFileSystemLoader(templatesDir)
	} else {
		templates.Loader = sourceLoader
	}
	templates.AddFuncs(gotl.DefaultFuncMap())
	templates.AddFuncs(goal.DefaultFuncMap())

	// GoAppLib app
	app := goal.NewApp(lucidApp, templates)

	// Routes
	mux := http.NewServeMux()

	// Pages
	goal.Register[*views.LandingPage](app, mux, "/")
	goal.Register[*views.DashboardPage](app, mux, "/dashboard")
	goal.Register[*views.EditorPage](app, mux, "/editor/{id}")
	goal.Register[*views.PlayerPage](app, mux, "/play/{id}")

	// Stitch-generated layout variants
	goal.Register[*views.LandingCompactPage](app, mux, "/landing/compact")
	goal.Register[*views.LandingTallPage](app, mux, "/landing/tall")

	// Compare page (side-by-side iframes)
	mux.HandleFunc("GET /compare", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/compare.html")
	})

	// Static files
	mux.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("./static"))))

	// API routes (stubs — data lives in IndexedDB for now)
	mux.HandleFunc("GET /api/projects", apiHandler(lucidApp.ListProjects))
	mux.HandleFunc("POST /api/projects", apiHandler(lucidApp.CreateProject))
	mux.HandleFunc("GET /api/projects/{id}", apiHandler(lucidApp.GetProject))
	mux.HandleFunc("PUT /api/projects/{id}", apiHandler(lucidApp.UpdateProject))
	mux.HandleFunc("DELETE /api/projects/{id}", apiHandler(lucidApp.DeleteProject))
	mux.HandleFunc("GET /api/projects/{id}/steps", apiHandler(lucidApp.GetSteps))
	mux.HandleFunc("PUT /api/projects/{id}/steps/{stepId}", apiHandler(lucidApp.UpdateStep))
	mux.HandleFunc("DELETE /api/projects/{id}/steps/{stepId}", apiHandler(lucidApp.DeleteStep))
	mux.HandleFunc("GET /api/projects/{id}/steps/{stepId}/screenshot", lucidApp.ServeScreenshot)
	mux.HandleFunc("POST /api/import", lucidApp.HandleImport)

	// Dev-only: seed test data into IndexedDB
	mux.HandleFunc("GET /seed", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/seed.html")
	})

	// Start
	port := envOr("PORT", "8080")
	addr := ":" + port
	fmt.Printf("\n  Lucid Capture (Go stack)\n")
	fmt.Printf("  http://localhost%s\n\n", addr)

	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// apiHandler wraps a function that returns (any, error) into an http.HandlerFunc.
func apiHandler(fn func(http.ResponseWriter, *http.Request) (any, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		result, err := fn(w, r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if result == nil {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}
