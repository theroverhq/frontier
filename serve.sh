#!/bin/bash
echo "Starting Jekyll via Docker..."
docker run --rm \
  --network host \
  --volume="$PWD:/srv/jekyll" \
  jekyll/jekyll \
  sh -c "bundle install && bundle exec jekyll serve --livereload"
