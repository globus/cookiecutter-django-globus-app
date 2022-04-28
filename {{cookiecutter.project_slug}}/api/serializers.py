from django.contrib.auth import get_user_model

from rest_framework import serializers

from social_django.models import UserSocialAuth


class UserSocialAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSocialAuth
        exclude = ["user"]
        depth = 1


class UserSerializer(serializers.ModelSerializer):
    social_auth = UserSocialAuthSerializer(read_only=True, many=True)
    class Meta:
        model = get_user_model()
        exclude = ["password"]
        depth = 1