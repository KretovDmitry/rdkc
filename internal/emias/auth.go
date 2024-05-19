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
)

type authResponse struct {
	Success bool `json:"success,omitempty"`
}

func (c *emiasClient) authorize(ctx context.Context) error {
	defer c.logCallDuration(time.Now())

	if err := c.getCookies(ctx); err != nil {
		return fmt.Errorf("get cookies: %w", err)
	}

	authURL := url.URL{
		Scheme: c.config.Emias.Host,
		Host:   c.config.Emias.Scheme,
	}

	q := authURL.Query()
	q.Set("c", "main")
	q.Set("m", "index")
	q.Set("method", "Logon")
	q.Set("login", c.config.Emias.Login)
	authURL.RawQuery = q.Encode()

	data := url.Values{}
	data.Set("login", c.config.Emias.Login)
	data.Set("psw", c.config.Emias.Password)

	request, err := http.NewRequestWithContext(ctx,
		http.MethodPost, authURL.String(), strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("create new request: %w", err)
	}

	request.Header.Set("connection", "keep-alive")
	request.Header.Set("user-agent", c.config.Emias.UserAgent)
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Content-Length", strconv.Itoa(len(data.Encode())))

	resp, err := c.Do(request)
	if err != nil {
		return fmt.Errorf("do auth request: %w", err)
	}
	defer resp.Body.Close()

	// TODO: special errors for bad emias server response

	var res authResponse
	if err = json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return fmt.Errorf("unmarshal response: %w", err)
	}

	if !res.Success {
		return fmt.Errorf("authorization failed: %s", c.config.Emias.Login)
	}

	return nil
}

// getCookies establishes a session with the emias server
// by setting provided cookies in the client's cookie store (cookieJar).
func (c *emiasClient) getCookies(ctx context.Context) error {
	defer c.logCallDuration(time.Now())

	getCookiesURL := url.URL{
		Scheme: c.config.Emias.Scheme,
		Host:   c.config.Emias.Host,
	}

	q := getCookiesURL.Query()
	q.Set("c", "portal")
	q.Set("m", "promed")
	q.Set("lang", "ru")
	getCookiesURL.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, getCookiesURL.String(), http.NoBody)
	if err != nil {
		return fmt.Errorf("create new request: %w", err)
	}

	req.Header.Set("connection", "keep-alive")

	resp, err := c.Do(req)
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
