import speech_recognition as sr
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import AudioTranscription
from .serializers import AudioTranscriptionSerializer
import os

class AudioTranscriptionViewSet(viewsets.ModelViewSet):
    queryset = AudioTranscription.objects.all().order_by('-created_at')
    serializer_class = AudioTranscriptionSerializer
    
    def perform_create(self, serializer):
        audio_transcription = serializer.save()
        
        # Get the path to the audio file
        audio_file_path = audio_transcription.audio_file.path
        
        try:
            # Initialize the recognizer
            recognizer = sr.Recognizer()
            
            # Load the audio file
            with sr.AudioFile(audio_file_path) as source:
                # Record the audio data
                audio_data = recognizer.record(source)
                
                # Recognize the speech using Google Speech Recognition
                text = recognizer.recognize_google(audio_data)
                
                # Save the transcript
                audio_transcription.transcript = text
                audio_transcription.save()
                
        except Exception as e:
            # If there's an error, set the transcript to the error message
            audio_transcription.transcript = f"Error transcribing audio: {str(e)}"
            audio_transcription.save()
    
    @action(detail=False, methods=['post'])
    def transcribe_audio(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)