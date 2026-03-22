#!/usr/bin/env bash
# sync.sh — Pull latest state from Stitch and save locally.
# Diffs are just `git diff stitch-sync/`.
#
# Usage:
#   ./stitch-sync/sync.sh                  # sync everything
#   ./stitch-sync/sync.sh manifest         # just metadata + design tokens
#   ./stitch-sync/sync.sh screens          # just HTML files
#   ./stitch-sync/sync.sh screenshots      # just screenshots

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/stitch-api.sh"

PROJECT_ID="9522660877005191774"
OUT_DIR="${SCRIPT_DIR}"

sync_manifest() {
  echo "=> Syncing manifest + design tokens..."

  local project_json
  project_json=$(stitch_get_project "${PROJECT_ID}")

  # Design tokens
  echo "${project_json}" | stitch_extract_tokens | jq --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '. + {syncedAt: $ts, projectId: "'"${PROJECT_ID}"'"}' > "${OUT_DIR}/design-tokens.json"
  echo "   Saved design-tokens.json"

  # Design system markdown
  echo "${project_json}" | stitch_extract_design_md > "${OUT_DIR}/design-system.md"
  echo "   Saved design-system.md"

  # Screen manifest
  local screens_json
  screens_json=$(stitch_list_screens "${PROJECT_ID}")
  echo "${screens_json}" | stitch_extract_manifest | jq --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '. + {syncedAt: $ts, projectId: "'"${PROJECT_ID}"'"}' > "${OUT_DIR}/screen-manifest.json"
  echo "   Saved screen-manifest.json"
}

sync_screens() {
  echo "=> Syncing screen HTML..."
  mkdir -p "${OUT_DIR}/html"

  local manifest="${OUT_DIR}/screen-manifest.json"
  if [[ ! -f "${manifest}" ]]; then
    echo "   No manifest found, running manifest sync first..."
    sync_manifest
  fi

  local count
  count=$(jq '.screens | length' "${manifest}")
  for i in $(seq 0 $((count - 1))); do
    local title url slug
    title=$(jq -r ".screens[$i].title" "${manifest}")
    url=$(jq -r ".screens[$i].htmlUrl" "${manifest}")
    device=$(jq -r ".screens[$i].deviceType" "${manifest}")
    slug=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

    # Append device type if mobile to disambiguate
    if [[ "${device}" == "MOBILE" ]]; then
      slug="${slug}-mobile"
    fi

    if [[ "${url}" != "null" && -n "${url}" ]]; then
      stitch_download "${url}" "${OUT_DIR}/html/${slug}.html"
      echo "   ${slug}.html (${device})"
    else
      echo "   ${slug} — no HTML available, skipping"
    fi
  done
}

sync_screenshots() {
  echo "=> Syncing screenshots..."
  mkdir -p "${OUT_DIR}/screenshots"

  local manifest="${OUT_DIR}/screen-manifest.json"
  if [[ ! -f "${manifest}" ]]; then
    echo "   No manifest found, running manifest sync first..."
    sync_manifest
  fi

  local count
  count=$(jq '.screens | length' "${manifest}")
  for i in $(seq 0 $((count - 1))); do
    local title url slug
    title=$(jq -r ".screens[$i].title" "${manifest}")
    url=$(jq -r ".screens[$i].screenshotUrl" "${manifest}")
    device=$(jq -r ".screens[$i].deviceType" "${manifest}")
    slug=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

    if [[ "${device}" == "MOBILE" ]]; then
      slug="${slug}-mobile"
    fi

    if [[ "${url}" != "null" && -n "${url}" ]]; then
      stitch_download "${url}" "${OUT_DIR}/screenshots/${slug}.png"
      echo "   ${slug}.png (${device})"
    else
      echo "   ${slug} — no screenshot available, skipping"
    fi
  done
}

# Main
case "${1:-all}" in
  manifest)    sync_manifest ;;
  screens)     sync_screens ;;
  screenshots) sync_screenshots ;;
  all)
    sync_manifest
    sync_screens
    sync_screenshots
    echo ""
    echo "Done. Run 'git diff stitch-sync/' to see what changed."
    ;;
  *)
    echo "Usage: $0 [manifest|screens|screenshots|all]"
    exit 1
    ;;
esac
