from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AudioTranscriptionViewSet

router = DefaultRouter()
router.register('transcriptions', AudioTranscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]