package views

import (
	"net/http"
)

// API handlers — placeholder stubs until proto-generated DAL is wired up.
// Each returns (result, error) to work with the apiHandler wrapper in main.go.

func (app *LucidApp) ListProjects(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return []any{}, nil
}

func (app *LucidApp) CreateProject(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) GetProject(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) UpdateProject(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) DeleteProject(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) GetSteps(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return []any{}, nil
}

func (app *LucidApp) UpdateStep(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) DeleteStep(w http.ResponseWriter, r *http.Request) (any, error) {
	// TODO: wire to generated DAL
	return nil, nil
}

func (app *LucidApp) ServeScreenshot(w http.ResponseWriter, r *http.Request) {
	// TODO: serve screenshot file from UploadDir
	http.NotFound(w, r)
}

func (app *LucidApp) HandleImport(w http.ResponseWriter, r *http.Request) {
	// TODO: accept ImportSession JSON, save screenshots, create project + steps
	http.Error(w, "Not implemented", http.StatusNotImplemented)
}
