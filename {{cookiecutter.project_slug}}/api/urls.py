from rest_framework.routers import DefaultRouter

from api.views import EndpointSearchView

router = DefaultRouter()
router.register(r'endpoints', EndpointSearchView, basename="endpoints")