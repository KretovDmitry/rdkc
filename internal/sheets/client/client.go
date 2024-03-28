package client

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/KretovDmitry/rdkc/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Retrieve a token, saves the token, then returns the generated client.
func Get(ctx context.Context) (*http.Client, error) {
	cfg, err := getConfig()
	if err != nil {
		return nil, fmt.Errorf(
			"unable to retrieve OAuth config: %w", err,
		)
	}
	tokFile := config.TokenFile
	tok, err := tokenFromFile(tokFile)
	if err != nil {
		tok, err = getTokenFromWeb(ctx, cfg)
		if err != nil {
			return nil, fmt.Errorf(
				"unable to retrieve token from web: %w", err,
			)
		}
		if err := saveToken(tokFile, tok); err != nil {
			return nil, fmt.Errorf(
				"unable to save token to file: %w", err,
			)
		}
	}

	return cfg.Client(ctx, tok), nil
}

// Retrieves a config from a local file.
func getConfig() (*oauth2.Config, error) {
	b, err := os.ReadFile(config.CredentialsFile)
	if err != nil {
		return nil, fmt.Errorf(
			"unable to read client credentials file: %w", err,
		)
	}

	// If modifying these scopes, delete your previously saved token.json.
	config, err := google.ConfigFromJSON(b, "https://www.googleapis.com/auth/spreadsheets.readonly")
	if err != nil {
		return nil, fmt.Errorf(
			"unable to parse client secret file to config: %w", err,
		)
	}

	return config, nil
}

// Request a token from the web, then returns the retrieved token.
func getTokenFromWeb(ctx context.Context, config *oauth2.Config) (*oauth2.Token, error) {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the "+
		"authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		return nil, fmt.Errorf("unable to read authorization code: %w", err)
	}

	tok, err := config.Exchange(ctx, authCode)
	if err != nil {
		return nil, fmt.Errorf(
			"unable to convert authorization code into token: %w", err,
		)
	}

	return tok, nil
}

// Retrieves a token from a local file.
func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

// Saves a token to a file path.
func saveToken(path string, token *oauth2.Token) error {
	fmt.Printf("Saving credential file to: %s\n", path)
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return fmt.Errorf("unable to cache oauth token: %w", err)
	}
	defer f.Close()

	if err := json.NewEncoder(f).Encode(token); err != nil {
		return fmt.Errorf("unable to encode oauth token: %w", err)
	}

	if err := os.Setenv("SHEETS_TOKEN", path); err != nil {
		return fmt.Errorf("unable to set SHEETS_TOKEN env: %w", err)
	}

	return nil
}
