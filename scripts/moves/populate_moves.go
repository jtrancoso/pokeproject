package moves

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"pokeproject/scripts/common"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type Move struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Accuracy    int    `json:"accuracy"`
	EffectChance *int  `json:"effect_chance"`
	PP          int    `json:"pp"`
	Priority    int    `json:"priority"`
	Power       *int   `json:"power"`
	DamageClass struct {
		Name string `json:"name"`
	} `json:"damage_class"`
	Type struct {
		Name string `json:"name"`
	} `json:"type"`
	EffectEntries []struct {
		Effect   string `json:"effect"`
		Language struct {
			Name string `json:"name"`
		} `json:"language"`
	} `json:"effect_entries"`
	FlavorTextEntries []struct {
		FlavorText string `json:"flavor_text"`
		Language   struct {
			Name string `json:"name"`
		} `json:"language"`
		VersionGroup struct {
			Name string `json:"name"`
		} `json:"version_group"`
	} `json:"flavor_text_entries"`
}

type GenerationMoves struct {
	ID    int `json:"id"`
	Moves []struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	} `json:"moves"`
}

func fetchGenerationMoves(genID int) ([]struct{ Name string `json:"name"`; URL string `json:"url"` }, error) {
	resp, err := http.Get(fmt.Sprintf("https://pokeapi.co/api/v2/generation/%d", genID))
	if err != nil {
		return nil, fmt.Errorf("error fetching Generation %d: %v", genID, err)
	}
	defer resp.Body.Close()

	var genMoves GenerationMoves
	if err := json.NewDecoder(resp.Body).Decode(&genMoves); err != nil {
		return nil, fmt.Errorf("error decoding Generation %d: %v", genID, err)
	}

	return genMoves.Moves, nil
}

func PopulateMoves() {
	projectRoot := common.GetProjectRoot()
	fmt.Println("Using directory:", projectRoot)

	// Load environment variables
	if err := godotenv.Load(filepath.Join(projectRoot, ".env")); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		log.Fatal("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}

	// Initialize Firestore
	ctx := context.Background()
	opt := option.WithCredentialsFile(filepath.Join(projectRoot, "service-account.json"))
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v", err)
	}
	defer client.Close()

	// Ensure database exists
	if err := common.EnsureDatabaseExists(ctx, client); err != nil {
		log.Printf("Warning: Could not verify database existence: %v", err)
	}

	// Create a test document to ensure database is working
	testDoc := map[string]interface{}{
		"test": true,
		"timestamp": time.Now(),
	}
	_, err = client.Collection("heartgold-moves").Doc("_test").Set(ctx, testDoc)
	if err != nil {
		log.Fatalf("Error creating test document: %v. Please ensure you have created the Firestore database in the Google Cloud Console.", err)
	}
	// Delete test document
	_, err = client.Collection("heartgold-moves").Doc("_test").Delete(ctx)
	if err != nil {
		log.Printf("Warning: Could not delete test document: %v", err)
	}

	// Fetch moves from all generations up to 4
	var allMoves []struct{ Name string `json:"name"`; URL string `json:"url"` }
	for genID := 1; genID <= 4; genID++ {
		moves, err := fetchGenerationMoves(genID)
		if err != nil {
			log.Printf("Warning: %v", err)
			continue
		}
		allMoves = append(allMoves, moves...)
		fmt.Printf("Found %d moves from Generation %d\n", len(moves), genID)
	}

	fmt.Printf("Total moves to process: %d\n", len(allMoves))

	// Process each move
	for _, move := range allMoves {
		// Fetch detailed move data
		resp, err := http.Get(move.URL)
		if err != nil {
			log.Printf("Error fetching move %s: %v", move.Name, err)
			continue
		}

		// Read the entire response body
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Printf("Error reading response for %s: %v", move.Name, err)
			continue
		}

		// Parse the JSON into a generic map to store all fields
		var moveData map[string]interface{}
		if err := json.Unmarshal(body, &moveData); err != nil {
			log.Printf("Error decoding JSON for %s: %v", move.Name, err)
			continue
		}

		// Store the complete data in Firestore
		_, err = client.Collection("heartgold-moves").Doc(move.Name).Set(ctx, moveData)
		if err != nil {
			log.Printf("Error storing %s in Firestore: %v", move.Name, err)
			continue
		}
		fmt.Printf("Stored %s in Firestore\n", move.Name)

		// Rate limiting to avoid overwhelming the API
		time.Sleep(1 * time.Second)
	}
} 