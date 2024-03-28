package emias

import (
	"encoding/json"
	"fmt"
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

func (c *emiasClient) authorize() error {
	defer logCallDuration(time.Now())

	if err := c.getCookies(); err != nil {
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

	resp, err := c.Do(request)
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
		return fmt.Errorf(`authorization failed with:
	login: %s
	password: %s`,
			config.EmiasUser.Login, config.EmiasUser.Password)
	}

	return nil
}
