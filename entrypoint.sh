#!/bin/sh


echo "Initializing /app from image..."
cp -r /app-template/* /app/

exec "$@"