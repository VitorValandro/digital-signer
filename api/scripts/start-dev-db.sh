#!/bin/bash
set -e

docker-compose -f ./dev-database-config.docker.yml up -d

