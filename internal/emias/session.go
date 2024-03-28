package emias

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// getCookies establishes a session with the emias server
// by setting provided cookies in the client's cookie store (cookieJar)
func (client *emiasClient) getCookies() error {
	defer logCallDuration(time.Now())

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
