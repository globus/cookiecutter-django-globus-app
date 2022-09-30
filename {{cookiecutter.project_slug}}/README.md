
# Cookiecutter Django Globus App

This cookiecutter project serves as a starting point for using the [Django Globus Portal Framework](https://github.com/globus/django-globus-portal-framework) (DGPF). Documentation for DGPF can be found [here](https://django-globus-portal-framework.readthedocs.io/en/stable/). Please see the installation instructions below to get an example application running using DGPF.

### Requirements
* [Node Active LTS Version](https://nodejs.org/download/release/latest-v16.x/)
* [Python3](https://devguide.python.org/#status-of-python-branches)
* PIP

### Initial Setup (OPTIONAL)
The Installation below will set default values for the Globus CLIENT_ID and SECRET_KEY.
If you want to use your own, go to [developers.globus.org](developers.globus.org), create a new app, and ensure the following:

* Native app **is not checked**
* Redirect URL is set to http://localhost:8000/complete/globus/

The Installation process creates a file for storing your credentials called 
`{{ cookiecutter.project_slug }}/settings/local.py`. It resides next to the 'settings.py' file. When asked for the `globus_client_id` and `globus_secret_key` below, use the ones created from the process above.

For Transfer to work, you will also need to add a globus_portal_endpoint ID. If left blank (the default), the application will attempt to set it to the value of your [Globus Connect Personal](https://www.globus.org/globus-connect-personal) endpoint. You can update this at any time in your settings files, but only one endpoint can be associated with the transfer portal for transferring to other searched endpoints.

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
	email [researcher@example.com]: 
	version [0.1.0]: 
	globus_client_id [f44c948b-8aa5-4881-85c5-e0a2300d96c4]:
	globus_secret_key [ScsmAsf/0yhP9/uI1vxAsmuRywWW1JLgCbxyKsnd0u8]:
	globus_search_index [25ad7f95-1c21-4f8e-a478-ebdfbdfba7ec]:
	globus_portal_endpoint []:
	```
4. `cd ./<project_slug>`
5. Run the following Django and NPM related commands to build the application
	```
	(Optional)
	python3 -m venv <path_to_venv> 
	source <path_to_venv>/bin/activate

	# Below is needed to build the transfer client, which is built using React - https://reactjs.org/
	npm install
	NODE_ENV=local ./node_modules/.bin/webpack

	pip install -r requirements.txt
	python manage.py migrate
	python manage.py collectstatic --no-input # If using runserver locally, this step does not need to be run
	python manage.py runserver
	```
6. Head to `http://localhost:8000` and click the Globus Login link in the upper right-hand corner

### Containerized Environment 
Coming Soon! :) 
