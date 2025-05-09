from rest_framework import serializers
from .models import AudioTranscription

class AudioTranscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioTranscription
        fields = ('id', 'audio_file', 'transcript', 'created_at', 'updated_at')
        read_only_fields = ('transcript', 'created_at', 'updated_at')