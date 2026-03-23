package gormbe

import (
	"context"
	"time"

	"github.com/google/uuid"
	v1 "github.com/panyam/lucidcapture/gen/go/lucidcapture/v1/models"
	v1gorm "github.com/panyam/lucidcapture/gen/gorm/lucidcapture/v1/gorm"
	v1dal "github.com/panyam/lucidcapture/gen/gorm/dal/lucidcapture/v1/gorm"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

// Store implements services.SceneStore using GORM (SQLite/Postgres).
type Store struct {
	DB         *gorm.DB
	ProjectDAL *v1dal.ProjectGORMDAL
	StepDAL    *v1dal.StepGORMDAL
}

// NewStore creates a new GORM-backed SceneStore and runs migrations.
func NewStore(db *gorm.DB) *Store {
	db.AutoMigrate(&v1gorm.ProjectGORM{}, &v1gorm.StepGORM{})
	return &Store{
		DB:         db,
		ProjectDAL: v1dal.NewProjectGORMDAL(""),
		StepDAL:    v1dal.NewStepGORMDAL(""),
	}
}

func (s *Store) ListProjects(ctx context.Context) ([]*v1.Project, error) {
	gormProjects, err := s.ProjectDAL.List(ctx, s.DB.Order("updated_at DESC"))
	if err != nil {
		return nil, err
	}
	projects := make([]*v1.Project, len(gormProjects))
	for i, gp := range gormProjects {
		p, _ := v1gorm.ProjectFromProjectGORM(nil, gp, nil)
		projects[i] = p
	}
	return projects, nil
}

func (s *Store) GetProject(ctx context.Context, id string) (*v1.Project, error) {
	gp, err := s.ProjectDAL.Get(ctx, s.DB, id)
	if err != nil {
		return nil, err
	}
	if gp == nil {
		return nil, nil
	}
	p, _ := v1gorm.ProjectFromProjectGORM(nil, gp, nil)
	return p, nil
}

func (s *Store) CreateProject(ctx context.Context, project *v1.Project) (*v1.Project, error) {
	if project.Id == "" {
		project.Id = uuid.New().String()
	}
	now := timestamppb.Now()
	project.CreatedAt = now
	project.UpdatedAt = now

	gp, err := v1gorm.ProjectToProjectGORM(project, nil, nil)
	if err != nil {
		return nil, err
	}
	if err := s.ProjectDAL.Create(ctx, s.DB, gp); err != nil {
		return nil, err
	}
	return project, nil
}

func (s *Store) UpdateProject(ctx context.Context, project *v1.Project) (*v1.Project, error) {
	project.UpdatedAt = timestamppb.Now()
	gp, err := v1gorm.ProjectToProjectGORM(project, nil, nil)
	if err != nil {
		return nil, err
	}
	if err := s.ProjectDAL.Update(ctx, s.DB, gp); err != nil {
		return nil, err
	}
	return project, nil
}

func (s *Store) DeleteProject(ctx context.Context, id string) error {
	// Delete all steps first
	s.DB.Where("project_id = ?", id).Delete(&v1gorm.StepGORM{})
	return s.ProjectDAL.Delete(ctx, s.DB, id)
}

func (s *Store) GetSteps(ctx context.Context, projectID string) ([]*v1.Step, error) {
	gormSteps, err := s.StepDAL.List(ctx, s.DB.Where("project_id = ?", projectID).Order(`"order" ASC`))
	if err != nil {
		return nil, err
	}
	steps := make([]*v1.Step, len(gormSteps))
	for i, gs := range gormSteps {
		st, _ := v1gorm.StepFromStepGORM(nil, gs, nil)
		steps[i] = st
	}
	return steps, nil
}

func (s *Store) UpdateStep(ctx context.Context, step *v1.Step) (*v1.Step, error) {
	gs, err := v1gorm.StepToStepGORM(step, nil, nil)
	if err != nil {
		return nil, err
	}
	if err := s.StepDAL.Update(ctx, s.DB, gs); err != nil {
		return nil, err
	}
	return step, nil
}

func (s *Store) DeleteStep(ctx context.Context, projectID, stepID string) error {
	if err := s.StepDAL.Delete(ctx, s.DB, stepID); err != nil {
		return err
	}
	// Recalculate project stats
	return s.recalcProjectStats(ctx, projectID)
}

func (s *Store) ImportSession(ctx context.Context, session *v1.ImportSession) (*v1.Project, error) {
	project := &v1.Project{
		Id:        uuid.New().String(),
		Title:     "Imported Scene",
		Privacy:   "public",
		CreatedAt: timestamppb.Now(),
		UpdatedAt: timestamppb.Now(),
	}

	gp, _ := v1gorm.ProjectToProjectGORM(project, nil, nil)
	if err := s.ProjectDAL.Create(ctx, s.DB, gp); err != nil {
		return nil, err
	}

	for i, importStep := range session.Steps {
		step := &v1.Step{
			Id:             importStep.Id,
			ProjectId:      project.Id,
			Order:          int32(i),
			Type:           importStep.Type,
			ScreenshotPath: "", // TODO: save screenshot from base64
			Duration:       3000,
			Transition:     "fade",
			Url:            importStep.Url,
			ViewportWidth:  importStep.ViewportWidth,
			ViewportHeight: importStep.ViewportHeight,
			ClickTarget:    importStep.ClickTarget,
		}
		gs, _ := v1gorm.StepToStepGORM(step, nil, nil)
		s.StepDAL.Create(ctx, s.DB, gs)
	}

	project.StepCount = int32(len(session.Steps))
	project.TotalDuration = int32(len(session.Steps)) * 3000
	project.UpdatedAt = timestamppb.Now()
	gp2, _ := v1gorm.ProjectToProjectGORM(project, nil, nil)
	s.ProjectDAL.Update(ctx, s.DB, gp2)

	return project, nil
}

func (s *Store) recalcProjectStats(ctx context.Context, projectID string) error {
	steps, err := s.GetSteps(ctx, projectID)
	if err != nil {
		return err
	}
	var totalDuration int32
	for _, st := range steps {
		totalDuration += st.Duration
	}

	gp, err := s.ProjectDAL.Get(ctx, s.DB, projectID)
	if err != nil || gp == nil {
		return err
	}
	gp.StepCount = int32(len(steps))
	gp.TotalDuration = totalDuration
	gp.UpdatedAt = time.Now()
	return s.ProjectDAL.Update(ctx, s.DB, gp)
}
