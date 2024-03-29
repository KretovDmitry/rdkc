package config

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
)

const (
	defaultHost = "0.0.0.0"
	defaultPort = 5000
)

type netAddress struct {
	Host string
	Port int
}

// NewNetAddress returns pointer to a new netAddress with default Host and Port
func NewNetAddress() *netAddress {
	return &netAddress{
		Host: defaultHost,
		Port: defaultPort,
	}
}

func (a netAddress) String() string {
	return fmt.Sprintf("%s:%d", a.Host, a.Port)
}

func (a *netAddress) Set(s string) error {
	s = strings.TrimPrefix(s, "http://")
	hp := strings.Split(s, ":")
	if len(hp) != 2 {
		return errors.New("need address in a form host:port")
	}
	port, err := strconv.Atoi(hp[1])
	if err != nil {
		return fmt.Errorf("invalid port: %w", err)
	}
	if hp[0] != "" {
		a.Host = hp[0]
	}
	a.Port = port
	return nil
}

type emiasUser struct {
	Login    string
	Password string
}

func (u *emiasUser) String() string {
	return fmt.Sprintf("Login: %s, Password: %s\r\n", u.Login, u.Password)
}

func (u *emiasUser) Set(credentials string) error {
	cr := strings.Split(credentials, ",")
	if len(cr) != 2 {
		return errors.New("need emias user in the form: login,password")
	}
	if cr[0] == "" || cr[1] == "" {
		return errors.New("need emias user in the form: login,password")
	}
	u.Login = cr[0]
	u.Password = cr[1]
	return nil
}

var (
	AddrToRun       = NewNetAddress()
	CredentialsFile string
	TokenFile       string
	SpreadsheetId   string
	DSN             string
	LogLevel        string
	EmiasUser       = new(emiasUser)
)

func Parse(ctx context.Context) error {
	var ok bool

	// flags take precedence over the default values
	flag.Var(AddrToRun, "a", "Net address host:port to run server")
	flag.Var(EmiasUser, "u", "Emias user credentials in the form: login,password")
	flag.StringVar(&DSN, "d", "", "Data source name in form postgres URL or DSN string")
	flag.StringVar(&LogLevel, "l", "info", "Log level")
	flag.Parse()

	// ENV variables have the highest priority
	if envRunAddr := os.Getenv("SERVER_ADDRESS"); envRunAddr != "" {
		if err := AddrToRun.Set(envRunAddr); err != nil {
			return fmt.Errorf("invalid SERVER_ADDRESS: %w", err)
		}
	}

	if credentials := os.Getenv("EMIAS_USER"); credentials != "" {
		err := EmiasUser.Set(credentials)
		if err != nil {
			return fmt.Errorf("invalid EMIAS_USER: %w", err)
		}
	}

	// The SHEETS_CREDENTIALS must contain user's credentials for Google
	// spreadsheets in JSON format.
	if CredentialsFile, ok = os.LookupEnv("SHEETS_CREDENTIALS"); !ok {
		return errors.New("empty SHEETS_CREDENTIALS")
	}

	// The file token.json stores the user's access and refresh tokens, and is
	// created automatically when the authorization flow completes for the first
	// time.
	TokenFile = path.Join(path.Dir(CredentialsFile), "token.json")
	if tokenFile := os.Getenv("SHEETS_TOKEN"); tokenFile != "" {
		TokenFile = tokenFile
	}

	if SpreadsheetId, ok = os.LookupEnv("SPREADSHEET_ID"); !ok {
		return errors.New("empty SPREADSHEET_ID")
	}
	if envDSN := os.Getenv("DATABASE_DSN"); envDSN != "" {
		DSN = envDSN
	}
	if envLogLevel := os.Getenv("LOG_LEVEL"); envLogLevel != "" {
		LogLevel = envLogLevel
	}

	return nil
}
