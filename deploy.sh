#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/.env.production}"
CERT_WAIT_SECONDS="${CERT_WAIT_SECONDS:-600}"
API_WAIT_SECONDS="${API_WAIT_SECONDS:-180}"

log() {
  printf '%s\n' "$1"
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

load_env_file() {
  [ -f "$ENV_FILE" ] || fail "Missing $ENV_FILE. Copy .env.production.example to .env.production and fill in the real values."
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
}

require_var() {
  eval "value=\${$1:-}"
  [ -n "$value" ] || fail "Required variable $1 is not set in $ENV_FILE"
}

wait_for_http() {
  url="$1"
  timeout="$2"
  elapsed=0

  while [ "$elapsed" -lt "$timeout" ]; do
    if curl --silent --show-error --output /dev/null "$url"; then
      return 0
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done

  return 1
}

wait_for_https_cert() {
  host="$1"
  timeout="$2"
  elapsed=0

  while [ "$elapsed" -lt "$timeout" ]; do
    if curl --silent --show-error --head "https://$host" >/dev/null 2>&1; then
      return 0
    fi
    sleep 10
    elapsed=$((elapsed + 10))
  done

  return 1
}

require_command git
require_command docker
require_command curl

docker info >/dev/null 2>&1 || fail "Docker daemon is not running or not accessible."

cd "$PROJECT_DIR"
load_env_file

DOMAIN="${DOMAIN:-bathudi.co.za}"
WWW_DOMAIN="${WWW_DOMAIN:-www.bathudi.co.za}"
TRAEFIK_NETWORK="${TRAEFIK_NETWORK:-traefik-public}"
TRAEFIK_CERTRESOLVER="${TRAEFIK_CERTRESOLVER:-myresolver}"

require_var DB_USER
require_var DB_PASSWORD
require_var SECRET_KEY
require_var ALLOWED_HOSTS

log "Deploying Bathudi from $PROJECT_DIR"
log "Using env file: $ENV_FILE"

docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1 || docker network create "$TRAEFIK_NETWORK" >/dev/null

if ! docker ps --format '{{.Image}} {{.Names}}' | grep -qi 'traefik'; then
  fail "No running Traefik container detected. SSL issuance requires a live Traefik instance with ACME configured for resolver '$TRAEFIK_CERTRESOLVER'."
fi

git pull --ff-only

docker compose pull bathudi_db
docker compose build --pull bathudi_api bathudi_web
docker compose up -d --remove-orphans bathudi_db bathudi_api bathudi_web

log "Waiting for Bathudi API on http://127.0.0.1:8002/api/courses/"
wait_for_http "http://127.0.0.1:8002/api/courses/" "$API_WAIT_SECONDS" || fail "Bathudi API did not become ready in time."

log "Waiting for trusted HTTPS certificate on https://$DOMAIN"
wait_for_https_cert "$DOMAIN" "$CERT_WAIT_SECONDS" || fail "Trusted HTTPS certificate was not issued for $DOMAIN. Check Traefik ACME logs and DNS."

if [ -n "$WWW_DOMAIN" ]; then
  log "Waiting for trusted HTTPS certificate on https://$WWW_DOMAIN"
  wait_for_https_cert "$WWW_DOMAIN" "$CERT_WAIT_SECONDS" || fail "Trusted HTTPS certificate was not issued for $WWW_DOMAIN. Check Traefik ACME logs and DNS."
fi

docker compose ps
curl --silent --show-error --head "https://$DOMAIN" >/dev/null

log "Bathudi redeploy completed successfully."
log "HTTPS is live for $DOMAIN"
