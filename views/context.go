package views

import (
	goal "github.com/panyam/goapplib"
	"gorm.io/gorm"
)

// LucidApp is the application context, accessible via app.Context in views.
type LucidApp struct {
	DB        *gorm.DB
	UploadDir string
}

// BasePage wraps goal.BasePage for app-specific helpers.
type BasePage struct {
	goal.BasePage
}

// SetCanonicalFromRequest sets the canonical URL from the request path.
func (p *BasePage) SetCanonicalFromRequest(app *goal.App[*LucidApp], r any) {
	// TODO: set from app config BaseUrl + request path
}
