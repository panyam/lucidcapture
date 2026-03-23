package views

import (
	"encoding/json"
	"net/http"

	models "github.com/panyam/lucidcapture/gen/go/lucidcapture/v1/models"
)

// API handlers use app.Store (SceneStore interface).
// If Store is nil, handlers return empty results (IndexedDB-only mode).

func (app *LucidApp) ListProjects(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return []any{}, nil
	}
	return app.Store.ListProjects(r.Context())
}

func (app *LucidApp) CreateProject(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	var req struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return app.Store.CreateProject(r.Context(), &models.Project{Title: req.Title})
}

func (app *LucidApp) GetProject(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	return app.Store.GetProject(r.Context(), r.PathValue("id"))
}

func (app *LucidApp) UpdateProject(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	var project models.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		return nil, err
	}
	project.Id = r.PathValue("id")
	return app.Store.UpdateProject(r.Context(), &project)
}

func (app *LucidApp) DeleteProject(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	return nil, app.Store.DeleteProject(r.Context(), r.PathValue("id"))
}

func (app *LucidApp) GetSteps(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return []any{}, nil
	}
	return app.Store.GetSteps(r.Context(), r.PathValue("id"))
}

func (app *LucidApp) UpdateStep(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	var step models.Step
	if err := json.NewDecoder(r.Body).Decode(&step); err != nil {
		return nil, err
	}
	step.Id = r.PathValue("stepId")
	step.ProjectId = r.PathValue("id")
	return app.Store.UpdateStep(r.Context(), &step)
}

func (app *LucidApp) DeleteStep(w http.ResponseWriter, r *http.Request) (any, error) {
	if app.Store == nil {
		return nil, nil
	}
	return nil, app.Store.DeleteStep(r.Context(), r.PathValue("id"), r.PathValue("stepId"))
}

func (app *LucidApp) ServeScreenshot(w http.ResponseWriter, r *http.Request) {
	// TODO: serve screenshot file from storage
	http.NotFound(w, r)
}

func (app *LucidApp) HandleImport(w http.ResponseWriter, r *http.Request) {
	if app.Store == nil {
		http.Error(w, "No server-side storage configured", http.StatusNotImplemented)
		return
	}
	var session models.ImportSession
	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	project, err := app.Store.ImportSession(r.Context(), &session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}
