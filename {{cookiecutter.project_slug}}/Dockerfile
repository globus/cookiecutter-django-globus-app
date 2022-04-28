FROM python:3.9

# Flip to 'production' for AWS deployments
ENV ENVIRONMENT=local 

ENV DJANGO_SETTINGS_MODULE={{ cookiecutter.project_slug }}.settings.base
ENV PYTHONBUFFERED=1

RUN mkdir /srv/logs

RUN apt-get update \
    && apt-get install -y curl \
    && pip install --upgrade pip

RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash - \
    && apt-get install -y nodejs build-essential

COPY requirements.txt /
RUN pip install -r /requirements.txt

COPY ./entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

COPY . /backend
WORKDIR /backend

RUN npm install
RUN npm rebuild node-sass
RUN npm run build-production

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]