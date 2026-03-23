package views

import (
	"net/http"

	goal "github.com/panyam/goapplib"
)

// LandingPage renders the marketing homepage.
type LandingPage struct {
	BasePage
}

func (p *LandingPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.Title = "Lucid Capture"
	p.DisableSplashScreen = true
	return nil, false
}

// LandingCompactPage renders the compact layout variant (Stitch-generated).
type LandingCompactPage struct {
	BasePage
}

func (p *LandingCompactPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.Title = "Lucid Capture — Compact"
	p.DisableSplashScreen = true
	return nil, false
}

// LandingTallPage renders the tall layout variant (Stitch-generated).
type LandingTallPage struct {
	BasePage
}

func (p *LandingTallPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.Title = "Lucid Capture — Tall"
	p.DisableSplashScreen = true
	return nil, false
}

// DashboardPage renders the project list.
type DashboardPage struct {
	BasePage

	// TODO: use generated proto types once protos are generated
	// Projects []*models.Project
}

func (p *DashboardPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.Title = "My Scenes"
	p.ActiveTab = "dashboard"

	// TODO: Load from generated DAL
	// ctx := app.Context
	// projects, err := dal.ListProjects(ctx.DB)

	return nil, false
}

// EditorPage renders the step editor for a specific project.
type EditorPage struct {
	BasePage

	ProjectID string
	// TODO: use generated proto types
	// Project *models.Project
	// Steps   []*models.Step
}

func (p *EditorPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.ProjectID = r.PathValue("id")
	p.Title = "Editor"
	p.ActiveTab = "dashboard"

	// TODO: Load project + steps from generated DAL

	return nil, false
}

// PlayerPage renders the full-screen playback view.
type PlayerPage struct {
	BasePage

	ProjectID string
	// TODO: use generated proto types
	// Project *models.Project
	// Steps   []*models.Step
}

func (p *PlayerPage) Load(r *http.Request, w http.ResponseWriter, app *goal.App[*LucidApp]) (error, bool) {
	p.ProjectID = r.PathValue("id")
	p.Title = "Player"
	p.CustomHeader = true // Full-screen, no nav

	// TODO: Load project + steps from generated DAL

	return nil, false
}
