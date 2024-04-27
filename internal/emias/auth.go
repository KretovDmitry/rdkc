package emias

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/config"
)

type authResponse struct {
	Success bool `json:"success,omitempty"`
}

func (client *emiasClient) authorize(ctx context.Context) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	defer client.logCallDuration(time.Now())

	if err := client.getCookies(ctx); err != nil {
		return fmt.Errorf("get cookies: %w", err)
	}

	authURL := url.URL{
		Scheme: scheme,
		Host:   host,
	}

	q := authURL.Query()
	q.Set("c", "main")
	q.Set("m", "index")
	q.Set("method", "Logon")
	q.Set("login", config.EmiasUser.Login)
	authURL.RawQuery = q.Encode()

	data := url.Values{}
	data.Set("login", config.EmiasUser.Login)
	data.Set("psw", config.EmiasUser.Password)

	request, err := http.NewRequest(
		http.MethodPost, authURL.String(), strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("create new request: %w", err)
	}

	request.Header.Set("connection", "keep-alive")
	request.Header.Set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Content-Length", strconv.Itoa(len(data.Encode())))

	resp, err := client.Do(request)
	if err != nil {
		return fmt.Errorf("do auth request: %w", err)
	}
	defer resp.Body.Close()

	// TODO: special errors for bad emias server response

	var res authResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return fmt.Errorf("unmarshal response: %w", err)
	}

	if !res.Success {
		return fmt.Errorf("authorization failed: %s", config.EmiasUser)
	}

	return nil
}

// getCookies establishes a session with the emias server
// by setting provided cookies in the client's cookie store (cookieJar)
func (client *emiasClient) getCookies(ctx context.Context) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	defer client.logCallDuration(time.Now())

	getCookiesURL := url.URL{
		Scheme: scheme,
		Host:   host,
	}

	q := getCookiesURL.Query()
	q.Set("c", "portal")
	q.Set("m", "promed")
	q.Set("lang", "ru")
	getCookiesURL.RawQuery = q.Encode()

	req, err := http.NewRequest(http.MethodGet, getCookiesURL.String(), http.NoBody)
	if err != nil {
		return fmt.Errorf("create new request: %w", err)
	}

	req.Header.Set("connection", "keep-alive")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("do get cookies request: %w", err)
	}
	defer resp.Body.Close()

	// always read entire resp.Body to reuse TCP-connection
	_, err = io.Copy(io.Discard, resp.Body)
	if err != nil {
		return fmt.Errorf("discard body: %w", err)
	}

	return nil
}
