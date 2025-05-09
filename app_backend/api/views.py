from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import AudioTranscription
from .serializers import AudioTranscriptionSerializer
import os
import requests
import tempfile
import mimetypes
from pydub import AudioSegment
import speech_recognition as sr
from django.conf import settings

class AudioTranscriptionViewSet(viewsets.ModelViewSet):
    queryset = AudioTranscription.objects.all().order_by('-created_at')
    serializer_class = AudioTranscriptionSerializer
    
    def perform_create(self, serializer):
        audio_transcription = serializer.save()
        
        # Get the path to the audio file
        audio_file_path = audio_transcription.audio_file.path
        
        try:
            # Use the transcribe_file method with the file path
            transcript = self.transcribe_file(audio_file_path)
            
            # Save the transcript
            audio_transcription.transcript = transcript
            audio_transcription.save()
                
        except Exception as e:
            # If there's an error, set the transcript to the error message
            audio_transcription.transcript = f"Error transcribing audio: {str(e)}"
            audio_transcription.save()

    def convert_to_wav(self, file_path):
        """Convert audio file to WAV format compatible with speech_recognition."""
        mime_type, _ = mimetypes.guess_type(file_path)
        
        # Create a temporary file for the converted WAV
        temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_wav_path = temp_wav.name
        temp_wav.close()
        
        # Determine file type and convert to WAV
        if mime_type:
            if mime_type.startswith('audio/'):
                # For audio files
                audio = AudioSegment.from_file(file_path)
                audio.export(temp_wav_path, format="wav")
            elif mime_type.startswith('video/'):
                # For video files - extract audio and convert to WAV
                audio = AudioSegment.from_file(file_path)
                audio.export(temp_wav_path, format="wav")
            else:
                raise ValueError(f"Unsupported file type: {mime_type}")
        else:
            # Try to convert the file anyway
            try:
                audio = AudioSegment.from_file(file_path)
                audio.export(temp_wav_path, format="wav")
            except Exception as e:
                raise ValueError(f"Could not convert file to WAV: {str(e)}")
        
        return temp_wav_path

    def transcribe_file(self, file_path):
        """Transcribe audio file using either SpeechRecognition or AssemblyAI."""
        if hasattr(settings, 'ASSEMBLY_AI_API_KEY') and settings.ASSEMBLY_AI_API_KEY:
            return self.transcribe_with_assembly_ai(file_path)
        else:
            return self.transcribe_with_speech_recognition(file_path)

    def transcribe_with_speech_recognition(self, file_path):
        """Transcribe using the speech_recognition library."""
        # Convert to WAV for speech_recognition
        wav_path = self.convert_to_wav(file_path)
        
        try:
            # Initialize the recognizer
            recognizer = sr.Recognizer()
            
            # Load the audio file
            with sr.AudioFile(wav_path) as source:
                # Record the audio data
                audio_data = recognizer.record(source)
                
                # Recognize the speech using Google Speech Recognition
                text = recognizer.recognize_google(audio_data)
                
            # Clean up the temporary file
            os.unlink(wav_path)
            
            return text
        except Exception as e:
            # Clean up the temporary file
            if os.path.exists(wav_path):
                os.unlink(wav_path)
            raise e

    def transcribe_with_assembly_ai(self, file_path):
        """Transcribe using AssemblyAI API."""
        api_key = settings.ASSEMBLY_AI_API_KEY
        
        # Upload the file to AssemblyAI
        def read_file(file_path):
            with open(file_path, 'rb') as f:
                while chunk := f.read(5242880):  # Read in chunks of 5MB
                    yield chunk
                    
        headers = {
            'authorization': api_key
        }
        
        upload_response = requests.post(
            'https://api.assemblyai.com/v2/upload',
            headers=headers,
            data=read_file(file_path)
        )
        
        if upload_response.status_code != 200:
            raise Exception(f"Error uploading file to AssemblyAI: {upload_response.text}")
            
        upload_url = upload_response.json()['upload_url']
        
        # Start transcription job
        transcript_response = requests.post(
            'https://api.assemblyai.com/v2/transcript',
            headers=headers,
            json={'audio_url': upload_url}
        )
        
        if transcript_response.status_code != 200:
            raise Exception(f"Error starting transcription job: {transcript_response.text}")
            
        transcript_id = transcript_response.json()['id']
        
        # Poll for transcription completion
        while True:
            polling_response = requests.get(
                f'https://api.assemblyai.com/v2/transcript/{transcript_id}',
                headers=headers
            )
            
            polling_response_json = polling_response.json()
            
            if polling_response_json['status'] == 'completed':
                return polling_response_json['text']
            elif polling_response_json['status'] == 'error':
                raise Exception(f"Transcription error: {polling_response_json['error']}")
            
            import time
            time.sleep(3)
    
    @action(detail=False, methods=['post'])
    def transcribe_audio(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)