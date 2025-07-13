#!/bin/bash

DOWNLOADS_DIR="./downloads"

if [ ! -d "$DOWNLOADS_DIR" ]; then
  echo "PRE > Downloads folder does not exists, generating it..."
  mkdir -p "$DOWNLOADS_DIR"
fi

docker-compose -f ./docker/compose.yaml up --build