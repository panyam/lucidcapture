#!/usr/bin/env bash
# stitch-api.sh — Thin wrappers around the Stitch REST API.
# Source this file, then call the functions.
#
# Requires: VIBESTITCH_API_KEY env var, curl, jq
#
# Usage:
#   source stitch-sync/stitch-api.sh
#   stitch_get_project 9522660877005191774
#   stitch_list_screens 9522660877005191774
#   stitch_get_screen 9522660877005191774 <screen_id>
#   stitch_download <url> <output_path>

STITCH_BASE="https://stitch.googleapis.com/v1"

_stitch_check() {
  if [[ -z "${VIBESTITCH_API_KEY}" ]]; then
    echo "Error: VIBESTITCH_API_KEY not set" >&2
    return 1
  fi
}

_stitch_get() {
  _stitch_check || return 1
  curl -sf "$1" -H "X-Goog-Api-Key: ${VIBESTITCH_API_KEY}"
}

# Get full project details (metadata, design theme, screen instances)
stitch_get_project() {
  local project_id="$1"
  _stitch_get "${STITCH_BASE}/projects/${project_id}"
}

# List all screens in a project
stitch_list_screens() {
  local project_id="$1"
  _stitch_get "${STITCH_BASE}/projects/${project_id}/screens"
}

# Get a single screen's details
stitch_get_screen() {
  local project_id="$1"
  local screen_id="$2"
  _stitch_get "${STITCH_BASE}/projects/${project_id}/screens/${screen_id}"
}

# Download a file from a Stitch download URL
stitch_download() {
  local url="$1"
  local output="$2"
  curl -sfL "${url}" -o "${output}"
}

# Extract design tokens JSON from project response
stitch_extract_tokens() {
  jq '{
    fonts: {body: .designTheme.bodyFont, headline: .designTheme.headlineFont, label: .designTheme.labelFont},
    colorMode: .designTheme.colorMode,
    colorVariant: .designTheme.colorVariant,
    customColor: .designTheme.customColor,
    roundness: .designTheme.roundness,
    spacingScale: .designTheme.spacingScale,
    overrides: {
      primaryColor: .designTheme.overridePrimaryColor,
      secondaryColor: .designTheme.overrideSecondaryColor,
      tertiaryColor: .designTheme.overrideTertiaryColor,
      neutralColor: .designTheme.overrideNeutralColor
    },
    namedColors: .designTheme.namedColors
  }'
}

# Extract design system markdown from project response
stitch_extract_design_md() {
  jq -r '.designTheme.designMd' | sed 's/^```markdown//' | sed 's/```$//'
}

# Extract screen manifest from screens list response
stitch_extract_manifest() {
  jq '{
    screens: [.screens[] | {
      id: (.name | split("/") | last),
      title: .title,
      deviceType: .deviceType,
      width: .width,
      height: .height,
      htmlUrl: .htmlCode.downloadUrl,
      screenshotUrl: .screenshot.downloadUrl
    }]
  }'
}
