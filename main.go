package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"pokeproject/api"
	"pokeproject/scripts"
	"strings"
	"sync"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

func initFirestore() *firestore.Client {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Fatal("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}
	ctx := context.Background()
	opt := option.WithCredentialsFile("service-account.json")
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v", err)
	}
	return client
}

// Simple in-memory rate limiter per IP (60 requests/minute)
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
}

type visitor struct {
	count    int
	resetAt  time.Time
}

func newRateLimiter() *rateLimiter {
	rl := &rateLimiter{visitors: make(map[string]*visitor)}
	// Cleanup old entries every 5 minutes
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			rl.mu.Lock()
			now := time.Now()
			for ip, v := range rl.visitors {
				if now.After(v.resetAt) {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	v, exists := rl.visitors[ip]
	if !exists || now.After(v.resetAt) {
		rl.visitors[ip] = &visitor{count: 1, resetAt: now.Add(time.Minute)}
		return true
	}
	v.count++
	return v.count <= 60
}

func getClientIP(r *http.Request) string {
	// Cloud Run sets X-Forwarded-For
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.Split(xff, ",")[0]
	}
	return strings.Split(r.RemoteAddr, ":")[0]
}

func main() {
	pokemonFlag := flag.Bool("pokemon", false, "Populate Pokémon (requires Firestore)")
	movesFlag := flag.Bool("moves", false, "Populate moves (requires Firestore)")
	exportFlag := flag.Bool("export", false, "Export Firestore data to JSON")
	flag.Parse()

	if *pokemonFlag {
		scripts.PopulateHeartgold()
		return
	}
	if *movesFlag {
		scripts.PopulateMoves()
		return
	}
	if *exportFlag {
		scripts.ExportJSON()
		return
	}

	startServer()
}

func startServer() {
	log.Println("Loading data...")
	cache, err := api.NewCacheFromJSON("data")
	if err != nil {
		log.Fatalf("Could not load data from JSON files: %v\nRun 'go run main.go -export' first to generate the data files.", err)
	}
	log.Printf("Cache ready: %d Pokemon, %d moves", len(cache.PokemonRaw), len(cache.MovesRaw))

	rl := newRateLimiter()
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/pokemon", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		api.GetPokemonListCached(w, r, cache)
	})

	mux.HandleFunc("/api/pokemon/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/moves") {
			api.GetPokemonMovesCached(w, r, cache)
		} else {
			api.GetPokemonByNameCached(w, r, cache)
		}
	})

	mux.HandleFunc("/api/types/effectiveness", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		api.GetTypeEffectiveness(w, r)
	})

	mux.HandleFunc("/api/moves/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		api.GetMoveByNameCached(w, r, cache)
	})

	mux.HandleFunc("/api/search", func(w http.ResponseWriter, r *http.Request) {
		api.SearchCached(w, r, cache)
	})

	// Serve frontend static files (production build)
	staticDir := "frontend/dist"
	if _, err := os.Stat(staticDir); err == nil {
		fs := http.FileServer(http.Dir(staticDir))
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			// If the file exists, serve it. Otherwise serve index.html (SPA routing)
			path := staticDir + r.URL.Path
			if _, err := os.Stat(path); err != nil {
				http.ServeFile(w, r, staticDir+"/index.html")
				return
			}
			fs.ServeHTTP(w, r)
		})
		log.Printf("Serving frontend from %s", staticDir)
	} else {
		log.Println("No frontend build found — API only mode")
	}

	// Wrap with rate limiter + CORS (CORS still useful for local dev)
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		// Rate limit API endpoints only
		if strings.HasPrefix(r.URL.Path, "/api/") {
			if !rl.allow(getClientIP(r)) {
				http.Error(w, `{"error":"Rate limit exceeded"}`, http.StatusTooManyRequests)
				return
			}
		}
		mux.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
