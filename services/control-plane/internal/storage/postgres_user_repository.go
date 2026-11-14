package storage

import (
	"context"
	"database/sql"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
)

type postgresUserRepo struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) UserRepository {
	return &postgresUserRepo{db: db}
}

func (r *postgresUserRepo) Create(ctx context.Context, u *node_registry.User) error {
	query := `INSERT INTO users (id, username, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, u.ID, u.Username, u.PasswordHash, u.Role)
	return err
}

func (r *postgresUserRepo) GetByUsername(ctx context.Context, username string) (*node_registry.User, error) {
	query := `SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1`
	row := r.db.QueryRowContext(ctx, query, username)

	var u node_registry.User
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
