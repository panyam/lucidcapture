package views

import (
	goal "github.com/panyam/goapplib"
	"gorm.io/gorm"
)

// LucidApp is the application context, accessible via app.Context in views.
type LucidApp struct {
	DB        *gorm.DB // nil until server-side persistence is wired up
	UploadDir string
}

// BasePage wraps goal.BasePage for app-specific helpers.
type BasePage struct {
	goal.BasePage
}
