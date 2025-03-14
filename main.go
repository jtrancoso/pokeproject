package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	scripts "pokeproject/scripts"
)

func main() {
	// Define command line flags
	pokemonFlag := flag.Bool("pokemon", false, "Run the Pokémon population script")
	movesFlag := flag.Bool("moves", false, "Run the moves population script")
	flag.Parse()

	// Run the selected script if flags are set
	if *pokemonFlag {
		log.Println("Running Pokémon population script...")
		scripts.PopulateHeartgold()
		return
	}
	if *movesFlag {
		log.Println("Running moves population script...")
		scripts.PopulateMoves()
		return
	}

	// If no flags are set, start the server
	startServer()
}

func startServer() {
	// Define routes
	http.HandleFunc("/pokemon", getPokemon)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func getPokemon(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement Pokemon retrieval from Firestore
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message": "Not implemented yet"}`))
} 