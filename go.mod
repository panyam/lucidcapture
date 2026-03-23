module github.com/panyam/lucidcapture

go 1.24.0

require (
	github.com/panyam/goapplib v0.0.34
	github.com/panyam/goutils v0.1.13
	github.com/panyam/templar v0.0.29
	gorm.io/driver/sqlite v1.6.0
	gorm.io/gorm v1.31.1
)

require (
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/mattn/go-sqlite3 v1.14.22 // indirect
	golang.org/x/text v0.32.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

// Local stack development — comment out before deploying
replace github.com/panyam/goapplib v0.0.34 => ./locallinks/newstack/goapplib/main

replace github.com/panyam/goutils v0.1.13 => ./locallinks/newstack/goutils/master

replace github.com/panyam/templar v0.0.29 => ./locallinks/newstack/templar/main
