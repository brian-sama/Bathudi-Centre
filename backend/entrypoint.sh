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
python manage.py seed_courses

exec gunicorn bathuditraining2center.wsgi:application --bind 0.0.0.0:8000 --workers 3
