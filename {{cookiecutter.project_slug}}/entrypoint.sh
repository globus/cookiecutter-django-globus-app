#!/bin/bash
python /backend/manage.py makemigrations
python /backend/manage.py migrate
python /backend/manage.py collectstatic --settings=$DJANGO_SETTINGS_MODULE --noinput

exec /usr/local/bin/gunicorn {{ cookiecutter.project_slug }}.wsgi \
    --env DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE \
    --env ENVIRONMENT=local \
    --name globus-portal-app \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --log-level info \
    --chdir /backend
