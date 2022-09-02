# Cookiecutter Django Globus App

This cookiecutter project serves as a starting point for using the [Django Globus Portal Framework](https://github.com/globus/django-globus-portal-framework) (DGPF). Documentation for DGPF can be found [here](https://django-globus-portal-framework.readthedocs.io/en/stable/). Please see the installation instructions below to get an example application running using DGPF.

This project along with DGPF also showcases using three of [Globus's APIs](https://docs.globus.org/api/) in a custom application - Auth, Search, and Transfer. This is just one example of many different ways Globus APIs can be used.

To see what is installed on the backend for the running the local API, check the requirements.txt file for more info. For the transfer portion of the project, check the package.json file to see what is running on the client.

### Requirements
* [Node Active LTS Version](https://nodejs.org/download/release/latest-v16.x/)
* [Python3](https://devguide.python.org/#status-of-python-branches)
* PIP

### Initial Setup (OPTIONAL)
The Installation below will set default values for the Globus CLIENT_ID and SECRET_KEY.
If you want to use your own, go to [developers.globus.org](developers.globus.org), create a new app, and ensure the following:

* Native app **is not checked**
* Redirect URL is set to http://localhost:8000/complete/globus

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
	project_name [Globus Portal]: 
	project_slug [django_globus_portal]: 
	description [A web app for managing project data]: 
	author_name [researcher]: 
	email [researcher@example.com]: 
	version [0.1.0]: 
	globus_client_id [f44c948b-8aa5-4881-85c5-e0a2300d96c4]:
	globus_secret_key [ScsmAsf/0yhP9/uI1vxAsmuRywWW1JLgCbxyKsnd0u8]:
	globus_search_index [25ad7f95-1c21-4f8e-a478-ebdfbdfba7ec]:
	globus_portal_endpoint [ddb59aef-6d04-11e5-ba46-22000b92c6ec]:
	```
4. `cd ./<project_slug>`
5. Run the following Django and NPM related commands to build the application
	```
	# Run this first before any of the optional node and npm commands below
	pip install -r requirements.txt

	# Below is needed to build the transfer client, which is built using React - https://reactjs.org/
	npm install
	./node_modules/.bin/webpack

	python manage.py migrate
	python manage.py collectstatic --no-input # If using runserver locally, this step does not need to be run
	python manage.py runserver
	```
6. Head to `http://localhost:8000` and click the Globus Login link in the upper right-hand corner

### Containerized Environment 
Using the containerized environment assumes you have some working knowledge of [Docker](https://docs.docker.com/).
##### Getting a local environment up and running
1. Build the container from the Dockerfile
	```
	docker build -t {{ cookiecutter.project_slug }}:latest .
    ```
2. Get it up and running
    ```
	docker run --name {{ cookiecutter.project_slug }} -p 8000:8000 -it {{ cookiecutter.project_slug }}:latest
    ```
That's pretty much it! Go to [http://localhost:8000](http://localhost:8000) in your browser and you should see the default web portal. This process spins up a python Django web server running gunicorn on port 8000.

You can also interact with the python Django container once it's running:
```
docker exec -it {{ cookiecutter.project_slug }} /bin/bash
docker exec -it {{ cookiecutter.project_slug }} python manage.py collectstatic --no-input
docker exec -it {{ cookiecutter.project_slug }} python manage.py makemigrations
```
