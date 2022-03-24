
# Cookiecutter Django Globus App

This cookiecutter project serves as a starting point for using the [Django Globus Portal Framework](https://github.com/globus/django-globus-portal-framework) (DGPF). Documentation for DGPF can be found [here](https://django-globus-portal-framework.readthedocs.io/en/stable/). Please see the installation instructions below to get an example application running using DGPF.

### Requirements
* Python3
* PIP

### Initial Setup (OPTIONAL)
The Installation below will set default values for the Globus CLIENT_ID and SECRET_KEY.
If you want to use your own, go to [developers.globus.org](developers.globus.org), create a new app, and ensure the following:

* Native app **is not checked**
* Redirect URL is set to http://localhost:8000/complete/globus

The Installation process creates a file for storing your credentials called 
`{{ cookiecutter.project_slug }}/settings/local.py`. It resides next to the 'settings.py' file. When asked for the `globus_client_id` and `globus_secret_key` below, use the ones created from the process above.

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
	use_django_rest_framework [n]:
	use_postgres [n]:
	globus_client_id [f44c948b-8aa5-4881-85c5-e0a2300d96c4]:
	globus_secret_key [ScsmAsf/0yhP9/uI1vxAsmuRywWW1JLgCbxyKsnd0u8]:
	globus_search_index [25ad7f95-1c21-4f8e-a478-ebdfbdfba7ec]:
	```
4. `cd ./<project_slug>`
5. Run the following Django related commands to build the application
	```
	python manage.py migrate
	python manage.py collectstatic --no-input # If using runserver locally, this step does not need to be run
	python manage.py runserver
	```
6. Head to `http://localhost:8000` and click the Globus Login link in the upper right-hand corner

### Containerized Environment 
Coming Soon! :) 
