#!/usr/bin/env bash
# sync.sh — Pull latest state from Stitch and save locally.
# Diffs are just `git diff stitch-sync/`.
#
# Usage:
#   ./stitch-sync/sync.sh                  # sync everything
#   ./stitch-sync/sync.sh manifest         # just metadata + design tokens
#   ./stitch-sync/sync.sh screens          # just HTML files
#   ./stitch-sync/sync.sh screenshots      # just screenshots
#   ./stitch-sync/sync.sh structure        # just structural outlines

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/stitch-api.sh"

PROJECT_ID="9522660877005191774"
OUT_DIR="${SCRIPT_DIR}"
TOMBSTONES="${SCRIPT_DIR}/tombstones.json"

# Check if a screen ID is tombstoned (intentionally deleted)
is_tombstoned() {
  local screen_id="$1"
  if [[ -f "${TOMBSTONES}" ]]; then
    jq -e --arg id "${screen_id}" '.deleted[] | select(.id == $id)' "${TOMBSTONES}" > /dev/null 2>&1
    return $?
  fi
  return 1
}

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

  # Remove tombstone entries for screens that no longer exist in Stitch
  prune_tombstones
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
    local title url slug screen_id
    title=$(jq -r ".screens[$i].title" "${manifest}")
    url=$(jq -r ".screens[$i].htmlUrl" "${manifest}")
    device=$(jq -r ".screens[$i].deviceType" "${manifest}")
    screen_id=$(jq -r ".screens[$i].id" "${manifest}")
    slug=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

    # Skip tombstoned screens
    if is_tombstoned "${screen_id}"; then
      continue
    fi

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
    local title url slug screen_id
    title=$(jq -r ".screens[$i].title" "${manifest}")
    url=$(jq -r ".screens[$i].screenshotUrl" "${manifest}")
    device=$(jq -r ".screens[$i].deviceType" "${manifest}")
    screen_id=$(jq -r ".screens[$i].id" "${manifest}")
    slug=$(echo "${title}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

    # Skip tombstoned screens
    if is_tombstoned "${screen_id}"; then
      continue
    fi

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

prune_tombstones() {
  if [[ ! -f "${TOMBSTONES}" || ! -f "${OUT_DIR}/screen-manifest.json" ]]; then
    return
  fi

  # Get all screen IDs currently in Stitch
  local live_ids
  live_ids=$(jq -r '.screens[].id' "${OUT_DIR}/screen-manifest.json" 2>/dev/null)

  # Filter tombstones to only keep IDs that still exist in Stitch
  local pruned
  pruned=$(jq --argjson live "$(echo "${live_ids}" | jq -R . | jq -s .)" \
    '.deleted = [.deleted[] | select(.id as $id | $live | index($id))]' \
    "${TOMBSTONES}")

  local before after
  before=$(jq '.deleted | length' "${TOMBSTONES}")
  after=$(echo "${pruned}" | jq '.deleted | length')

  if [[ "${before}" != "${after}" ]]; then
    echo "${pruned}" | jq '.' > "${TOMBSTONES}"
    echo "=> Pruned tombstones: ${before} → ${after} (removed $(( before - after )) stale entries)"
  fi
}

# Main
case "${1:-all}" in
  manifest)    sync_manifest ;;
  screens)     sync_screens ;;
  screenshots) sync_screenshots ;;
  structure)
    "${SCRIPT_DIR}/extract-structure.sh"
    ;;
  all)
    sync_manifest
    sync_screens
    sync_screenshots
    "${SCRIPT_DIR}/extract-structure.sh"
    echo ""
    echo "Done. Run 'git diff stitch-sync/' to see what changed."
    ;;
  *)
    echo "Usage: $0 [manifest|screens|screenshots|structure|all]"
    exit 1
    ;;
esac
