#!/bin/sh

if [ -z "$(ls -A /app 2>/dev/null)" ]; then
  echo "Initializing /app from image..."
  cp -r /app-template/* /app/
fi

exec "$@"