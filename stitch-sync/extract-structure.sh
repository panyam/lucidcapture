#!/usr/bin/env bash
# extract-structure.sh — Parse HTML files into diffable structural outlines.
#
# For each HTML file in stitch-sync/html/, produces a JSON structure in
# stitch-sync/structure/ with the same name but .json extension.
#
# The structure captures:
#   - Semantic elements (header, nav, main, aside, section, footer)
#   - Headings (h1-h6) with text content
#   - Buttons and links with text content
#   - Key layout classes (grid, flex patterns)
#   - HTML comments (used as component markers by Stitch)
#
# This is diffable and resilient to pixel/styling changes — catches
# structural additions, removals, and reordering.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_DIR="${SCRIPT_DIR}/html"
OUT_DIR="${SCRIPT_DIR}/structure"

mkdir -p "${OUT_DIR}"

extract_structure() {
  local html_file="$1"
  local name
  name=$(basename "${html_file}" .html)

  # Use a Python one-liner to parse the HTML properly
  python3 - "${html_file}" <<'PYEOF'
import sys, json, re
from html.parser import HTMLParser

class StructureExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.depth = 0
        self.current_text = ""
        self.in_tag = None
        self.semantic_tags = {
            "header", "nav", "main", "aside", "section", "footer",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "button", "a", "form", "input", "textarea", "select",
            "img", "video", "table"
        }
        self.layout_classes = re.compile(
            r'(grid[-\w]*|flex[-\w]*|col-span[-\w]*|row-span[-\w]*|'
            r'aspect[-\w]*|fixed|sticky|absolute|relative|'
            r'bg-[a-z][-\w]*|rounded[-\w]*|shadow[-\w]*)'
        )

    def handle_comment(self, data):
        text = data.strip()
        if text:
            self.elements.append({
                "type": "comment",
                "text": text,
                "depth": self.depth
            })

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes = attrs_dict.get("class", "")
        # Extract layout-relevant classes
        layout = self.layout_classes.findall(classes)

        if tag in self.semantic_tags:
            entry = {"type": tag, "depth": self.depth}
            if layout:
                entry["layout"] = layout
            if tag == "a":
                href = attrs_dict.get("href", "")
                if href:
                    entry["href"] = href
            if tag == "img":
                alt = attrs_dict.get("alt", "")
                if alt:
                    entry["alt"] = alt
            if tag == "input":
                entry["input_type"] = attrs_dict.get("type", "text")
                ph = attrs_dict.get("placeholder", "")
                if ph:
                    entry["placeholder"] = ph
            self.in_tag = entry
            self.current_text = ""
            self.elements.append(entry)

        # Track div/section with notable layout classes
        elif tag == "div" and layout:
            self.elements.append({
                "type": "div",
                "layout": layout,
                "depth": self.depth
            })

        self.depth += 1

    def handle_endtag(self, tag):
        self.depth = max(0, self.depth - 1)
        if self.in_tag and self.in_tag["type"] == tag:
            text = self.current_text.strip()
            if text and len(text) < 120:
                self.in_tag["text"] = text
            self.in_tag = None
            self.current_text = ""

    def handle_data(self, data):
        if self.in_tag:
            self.current_text += data

with open(sys.argv[1], "r") as f:
    html = f.read()

extractor = StructureExtractor()
extractor.feed(html)

# Filter out noise — keep only meaningful entries
meaningful = [
    e for e in extractor.elements
    if e["type"] != "div" or len(e.get("layout", [])) > 1
]

print(json.dumps(meaningful, indent=2))
PYEOF
}

echo "=> Extracting HTML structure..."
for html_file in "${HTML_DIR}"/*.html; do
  name=$(basename "${html_file}" .html)
  extract_structure "${html_file}" > "${OUT_DIR}/${name}.json"
  count=$(jq 'length' "${OUT_DIR}/${name}.json")
  echo "   ${name}.json (${count} elements)"
done
echo "   Done."
