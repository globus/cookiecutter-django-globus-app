#!/bin/bash
python /backend/manage.py makemigrations
python /backend/manage.py migrate
python /backend/manage.py collectstatic --no-input
python /backend/manage.py runserver 0.0.0.0:80 
