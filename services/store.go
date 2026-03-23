package services

import (
	"context"

	v1 "github.com/panyam/lucidcapture/gen/go/lucidcapture/v1/models"
)

// SceneStore is the storage interface for scenes (projects + steps).
// API handlers use this interface — they don't know which backend is active.
type SceneStore interface {
	// Projects
	ListProjects(ctx context.Context) ([]*v1.Project, error)
	GetProject(ctx context.Context, id string) (*v1.Project, error)
	CreateProject(ctx context.Context, project *v1.Project) (*v1.Project, error)
	UpdateProject(ctx context.Context, project *v1.Project) (*v1.Project, error)
	DeleteProject(ctx context.Context, id string) error

	// Steps
	GetSteps(ctx context.Context, projectID string) ([]*v1.Step, error)
	UpdateStep(ctx context.Context, step *v1.Step) (*v1.Step, error)
	DeleteStep(ctx context.Context, projectID, stepID string) error

	// Import from extension
	ImportSession(ctx context.Context, session *v1.ImportSession) (*v1.Project, error)
}
