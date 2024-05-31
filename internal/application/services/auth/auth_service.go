package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/application/errs"
	"github.com/KretovDmitry/rdkc/internal/application/interfaces"
	"github.com/KretovDmitry/rdkc/internal/application/repositories"
	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/internal/domain/entities/user"
	"github.com/KretovDmitry/rdkc/pkg/logger"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	userRepo repositories.UserRepository
	logger   logger.Logger
	config   *config.Config
}

func NewService(
	userRepo repositories.UserRepository,
	logger logger.Logger,
	config *config.Config,
) (*Service, error) {
	if config == nil {
		return nil, errors.New("nil dependency: config")
	}
	return &Service{
		userRepo: userRepo,
		logger:   logger,
		config:   config,
	}, nil
}

var _ interfaces.AuthService = (*Service)(nil)

// Registr user.
func (s *Service) Register(ctx context.Context, login, password string) (user.ID, error) {
	var userID user.ID = -1

	// Careate password hash.
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(password), s.config.PasswordHashCost)
	if err != nil {
		return userID, fmt.Errorf("hash password: %w", err)
	}

	// Create user.
	return s.userRepo.CreateUser(ctx, login, string(hashPassword))
}

// Authenticate user by login.
func (s *Service) Login(ctx context.Context, login, password string) (*user.User, error) {
	// Retrieve user from the database with provided login.
	user, err := s.userRepo.GetUserByLogin(ctx, login)
	if err != nil {
		return nil, fmt.Errorf("get user %q: %w", login, err)
	}

	// Compare stored and provided passwords.
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return nil, fmt.Errorf("%w: password", errs.ErrInvalidCredentials)
		}
		return nil, fmt.Errorf("compare passwords: %w", err)
	}

	return user, nil
}

// BuildAuthToken creates a JWT string for the given user ID.
func (s *Service) BuildAuthToken(userID user.ID) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, entities.AuthClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.JWT.Expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		UserID: userID,
	})

	tokenString, err := token.SignedString([]byte(s.config.JWT.SigningKey))
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("Bearer %s", tokenString), nil
}

// GetUserFromToken extracts the user ID from a JWT token and returns user.
func (s *Service) GetUserFromToken(ctx context.Context, tokenString string) (*user.User, error) {
	claims := new(entities.AuthClaims)

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	token, err := jwt.ParseWithClaims(tokenString, claims,
		func(token *jwt.Token) (interface{}, error) {
			// Verify that the token method is HS256.
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf(
					"%w: unexpected signing method: %v",
					errs.ErrInvalidCredentials, token.Header["alg"],
				)
			}

			// Return the secret key.
			return []byte(s.config.JWT.SigningKey), nil
		})
	// Check for errors.
	if err != nil {
		return nil, fmt.Errorf("%w: %w", errs.ErrInvalidCredentials, err)
	}

	// Check if the token is valid.
	if !token.Valid {
		return nil, fmt.Errorf("%w: %w", errs.ErrInvalidCredentials, err)
	}

	// Get user from repo by id.
	user, err := s.userRepo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}

	// Return the user.
	return user, nil
}
