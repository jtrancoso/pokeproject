# Pokémon HeartGold Data Collector

This Go script fetches Pokémon data from the PokeAPI and stores information about Pokémon that appear in Pokémon HeartGold in a Firestore database.

## Prerequisites

- Go 1.21 or later
- A Google Cloud project with Firestore enabled
- A service account key file with Firestore access

## Setup

1. Create a service account in Google Cloud Console:

   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant it the necessary Firestore permissions (Cloud Datastore User role)
   - Create a new key (JSON format)

2. Set up your credentials:

   - Download the service account key file from Google Cloud Console
   - Save it as `service-account.json` in the project root directory
   - ⚠️ Never commit this file to version control!
   - Copy `.env.example` to `.env` and set your Google Cloud project ID:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and replace `your-project-id` with your actual Google Cloud project ID
   - ⚠️ Never commit the `.env` file to version control!

3. Install dependencies:
   ```bash
   go mod tidy
   ```

## Usage

Run the script:

```bash
go run main.go
```

The script will:

1. Fetch the Johto Pokédex entries from PokeAPI
2. Store the data in a Firestore collection named `heartgold-pokemon`

## Note

The script includes rate limiting (1 second between requests) to avoid overwhelming the PokeAPI.
