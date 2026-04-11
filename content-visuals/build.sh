#!/bin/bash
# Build MARP slides to PNG images for blog embedding
# Usage: bash content-visuals/build.sh [slide-name]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SLIDES_DIR="$SCRIPT_DIR/slides"
OUTPUT_DIR="$SCRIPT_DIR/output"
THEME_FILE="$SCRIPT_DIR/theme/tuinhub.css"
PUBLIC_BLOG="$SCRIPT_DIR/../public/blog"

mkdir -p "$OUTPUT_DIR" "$PUBLIC_BLOG"

build_slide() {
  local name="$1"
  local input="$SLIDES_DIR/${name}.md"
  local output="$OUTPUT_DIR/${name}"

  if [ ! -f "$input" ]; then
    echo "ERROR: $input not found"
    return 1
  fi

  echo "Building: $name"
  npx @marp-team/marp-cli \
    "$input" \
    --theme-set "$THEME_FILE" \
    --images png \
    --image-scale 2 \
    -o "$output.png"

  # Copy outputs to public/blog/ for web serving
  if [ -d "$output" ] || ls "${output}"*.png 1>/dev/null 2>&1; then
    cp "${output}"*.png "$PUBLIC_BLOG/" 2>/dev/null
    echo "  -> Copied to public/blog/"
  fi

  echo "  Done: $name"
}

if [ -n "$1" ]; then
  build_slide "$1"
else
  # Build all slides
  for file in "$SLIDES_DIR"/*.md; do
    name=$(basename "$file" .md)
    build_slide "$name"
  done
fi

echo ""
echo "All slides built. Output in: $OUTPUT_DIR"
echo "Web-ready images in: $PUBLIC_BLOG"
