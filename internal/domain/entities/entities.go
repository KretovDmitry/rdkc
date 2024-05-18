package entities

import (
	"github.com/KretovDmitry/rdkc/internal/domain/entities/user"
	"github.com/golang-jwt/jwt/v5"
)

type AuthClaims struct {
	jwt.RegisteredClaims
	UserID user.ID
}
