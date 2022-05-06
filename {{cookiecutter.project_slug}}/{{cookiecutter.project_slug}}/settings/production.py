from ssm_parameter_store import EC2ParameterStore

import globus_sdk

store = EC2ParameterStore(
    region_name="us-east-1",
)
parameters = store.get_parameters_by_path("/django/django_globus_app/", strip_path=True)

DEBUG = True
PORTAL_ENDPOINT_ID = parameters.get(
    "PORTAL_ENDPOINT_ID", globus_sdk.LocalGlobusConnectPersonal().endpoint_id
)
SECRET_KEY = parameters.get("SECRET_KEY")
SOCIAL_AUTH_GLOBUS_KEY = parameters.get("SOCIAL_AUTH_GLOBUS_KEY")
SOCIAL_AUTH_GLOBUS_SECRET = parameters.get("SOCIAL_AUTH_GLOBUS_SECRET")
SOCIAL_AUTH_REDIRECT_IS_HTTPS = True
