package config

import (
	"flag"
	"log"
	"os"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type (
	// Config represents an application configuration.
	Config struct {
		// The data source name (DSN) for connecting to the database.
		DSN string `env:"DATABASE_URI"`
		// Subconfigs.
		Emias      Emias      `yaml:"emias"`
		HTTPServer HTTPServer `yaml:"http_server"`
		JWT        JWT        `yaml:"jwt"`
		Logger     Logger     `yaml:"logger"`
		Sheets     Sheets     `yaml:"google_sheets"`
		// Cost to hash the password. Must be grater than 3.
		PasswordHashCost int `yaml:"password_hash_cost" env-default:"14"`
		// Path to migrations.
		Migrations string `yaml:"migrations_path"`
	}
	// Config for interaction with emias service.
	Emias struct {
		// The address of the emias server.
		Host   string `yaml:"host" env:"EMIAS_HOST"`
		Scheme string `yaml:"scheme"`
		// Mock real user agent.
		UserAgent string `yaml:"user_agent"`
		// Client timeout.
		Timeout time.Duration `yaml:"timeout" env-default:"10s"`
		// Time interval between calls.
		Every time.Duration `yaml:"every" env-default:"10s"`
		// Number of simultaneous calls to the emias service.
		Burst int `yaml:"burst" env-default:"10"`
		// Authentication credentials.
		Login    string `env:"EMIAS_LOGIN"`
		Password string `env:"EMIAS_PASSWORD"`
	}
	// Config for HTTP server.
	HTTPServer struct {
		// The server startup address.
		Address string `yaml:"run_address" env:"RUN_ADDRESS" env-default:"127.0.0.1:5000"`
		// Read header timeout.
		HeaderTimeout time.Duration `yaml:"header_timeout" env-default:"5s"`
		// Idle timeout.
		IdleTimeout time.Duration `yaml:"idle_timeout" end-default:"60s"`
		// Shutdown timeout.
		ShutdownTimeout time.Duration `yaml:"shutdown_timeout" env:"SHUTDOWN_TIMEOUT" env-default:"30s"`
	}
	// Config for application's logger.
	Logger struct {
		// Path to store log files.
		Path string `yaml:"log_path" env:"LOG_PATH"`
		// Application logging level.
		Level string `yaml:"level" env:"LOG_LEVEL" env-default:"info"`
		// Log files details.
		MaxSizeMB  int `yaml:"max_size_mb"`
		MaxBackups int `yaml:"max_backups"`
		MaxAgeDays int `yaml:"max_age_days"`
	}
	// Config for JWT.
	JWT struct {
		// JWT signing key.
		SigningKey string `yaml:"signing_key" env:"JWT_SIGNING_KEY"`
		// JWT expiration.
		Expiration time.Duration `yaml:"expiration" env:"JWT_EXPIRATION" env-default:"24h"`
	}
	// Config for Google Sheets access.
	Sheets struct {
		// Path to the file with user's credentials for Google spreadsheets in JSON format.
		CredentialsFile string `yaml:"credentials_file" env:"SHEETS_CREDENTIALS"`
		// Path to the file with token.
		TokenFile string `yaml:"token_file" env:"SHEETS_TOKEN"`
		// ID of the Google Sheet.
		SpreadsheetID string `yaml:"spreadsheet_id" env:"SPREADSHEET_ID"`
	}
)

// Order of loading configuration:
// 1. YAML file
// 2. Flags
// 3. Environment variables

// Load returns an application configuration which is populated
// from the given configuration file, flags and environment variables.
func MustLoad() *Config {
	// Configuration yaml file path.
	configPath := "./config/local.yml"

	// Check if file exists.
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatalf("config file does not exist: %v", err)
	}

	var cfg Config

	// Load from YAML cfg file.
	file, err := os.Open(configPath)
	if err != nil {
		log.Fatalf("failed to open config file: %v", err)
	}
	if err = cleanenv.ParseYAML(file, &cfg); err != nil {
		log.Fatalf("failed to parse config file: %v", err)
	}

	// Read given flags. If not provided use file values.
	flag.StringVar(&cfg.HTTPServer.Address, "a", cfg.HTTPServer.Address, "server startup address")
	flag.StringVar(&cfg.DSN, "d", cfg.DSN, "server data source name")
	flag.StringVar(&cfg.Logger.Level, "l", cfg.Logger.Level, "logger level")
	flag.Parse()

	// Read environment variables.
	if err = cleanenv.ReadEnv(&cfg); err != nil {
		log.Fatalf("failed to read environment variables: %v", err)
	}

	return &cfg
}
