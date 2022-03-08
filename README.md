
# Cookiecutter Django Globus App

This cookiecutter project serves as a starting point for using the Django Globus Portal Framework (DGPF). Please
see the installation instructions below to get an example application running using DGPF.

### Requirements
* Python3
* PIP

### Installation
(Optional) Create a venv for installing modules:
```
python3 -m venv <path_to_venv> 
source <path_to_venv>/bin/activate
```
1. Install cookiecutter
```
pip install cookiecutter
```
2. Point cookiecutter to this repository:
```
cookiecutter https://github.com/globus/cookiecutter-django-globus-app
```
3. Answer the questions (defaults are provided)
```
project_name [My Portal]: 
project_slug [django_my_portal]: 
description [A science gateway for cataloging datasets]: 
author_name [researcher]: 
domain_name [example.com]: 
email [researcher@example.com]: 
version [0.1.0]: 
Select open_source_license:
1 - Apache Software License 2.0
2 - MIT
3 - BSD
4 - GPLv3
5 - Not open source
Choose from 1, 2, 3, 4, 5 [1]: 
timezone [UTC]: 
use_drf [n]: 
globus_client_id [4a217739-081e-47db-ab94-b8f9090d1d82]: 
globus_secret_key [GGU2Zcr96HweOdwNpRaw/Z0Gz+TFv+X1svYmfS14NsM=]: 
globus_search_index [4dcf50b9-14e7-4994-be36-6c6b11a73cd2]: 
```
4. `cd ./<project_slug>`
5. Run the following Django related commands to build the application
```
python manage.py migrate
python manage.py collectstatic --no-input # If using runserver locally, this step does not need to be run
python manage.py runserver
```
6. Head to `http://localhost:8000` and click the Globus Login link in the upper right-hand corner

### Additional Setup
If you want to use your own Globus CLIENT_ID and SECRET_KEY, go to developers.globus.org,
create a new app, and ensure the following:

* Native app **is not checked**
* Redirect URL is set to http://localhost:8000/complete/globus