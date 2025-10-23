#!/bin/sh
set -e

echo "Resetting /app from image template..."
rm -rf /app/*
cp -r /app-template/* /app/

exec "$@"