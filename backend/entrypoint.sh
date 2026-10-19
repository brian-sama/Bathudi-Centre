#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#sqlite}" = "$DATABASE_URL" ]; then
  echo "Waiting for PostgreSQL..."
  python - <<'PY'
import os
import time

import psycopg2

database_url = os.environ["DATABASE_URL"]

for attempt in range(30):
    try:
        connection = psycopg2.connect(database_url)
        connection.close()
        print("PostgreSQL is ready.")
        break
    except Exception as exc:
        print(f"PostgreSQL unavailable ({attempt + 1}/30): {exc}")
        time.sleep(2)
else:
    raise SystemExit("PostgreSQL did not become ready in time.")
PY
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py seed_courses || echo "Warning: seed_courses exited with non-zero status"
python seed_production_data.py || echo "Warning: seed_production_data exited with non-zero status"
python manage.py ensure_superuser || echo "Warning: ensure_superuser exited with non-zero status"

exec gunicorn bathuditraining2center.wsgi:application --bind 0.0.0.0:8000 --workers 3
