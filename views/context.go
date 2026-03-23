package views

import (
	goal "github.com/panyam/goapplib"
	"github.com/panyam/lucidcapture/services"
)

// LucidApp is the application context, accessible via app.Context in views.
type LucidApp struct {
	Store services.SceneStore // nil when using client-side IndexedDB only
}

// BasePage wraps goal.BasePage for app-specific helpers.
type BasePage struct {
	goal.BasePage
}
