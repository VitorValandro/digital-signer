#!/bin/bash
set -e

docker-compose -f ./dev-mongodb-config.docker.yml up -d

