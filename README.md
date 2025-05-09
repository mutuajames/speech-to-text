# Audio/Video Transcription System

A robust web application for transcribing audio and video content with dual transcription engines, file upload capabilities, and a modern React frontend.

## Features

- **Dual Transcription Engines**: Uses both local speech_recognition and AssemblyAI cloud transcription
- **Multiple Input Methods**:
  - Real-time audio recording
  - File upload supporting various audio/video formats
- **Format Conversion**: Automatically converts any audio/video format to proper WAV format
- **Robust Error Handling**: Gracefully handles format issues and failed transcriptions
- **Modern UI**: User-friendly interface with tabs, previews, and feedback mechanisms

## Technologies Used

### Backend
- Django / Django REST Framework
- speech_recognition for local transcription
- AssemblyAI API integration for cloud transcription
- pydub and ffmpeg for audio/video conversion

### Frontend
- React
- MediaRecorder API
- File handling and preview capabilities

## Installation

### Prerequisites
- Python 3.7+
- Node.js and npm
- ffmpeg (for audio/video conversion)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install django djangorestframework pydub SpeechRecognition requests
   ```

4. Install ffmpeg:
   - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

5. Configure Django settings:
   ```python
   # In settings.py
   MEDIA_URL = '/media/'
   MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
   
   # Optional: AssemblyAI API key
   ASSEMBLYAI_API_KEY = os.environ.get('ASSEMBLYAI_API_KEY', '')
   ```

6. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

## Usage

1. Start the Django server:
   ```bash
   python manage.py runserver
   ```

2. Access the application at `http://localhost:8000`

3. Choose your input method:
   - **Record**: Click the microphone icon to start recording, and click again to stop
   - **Upload**: Switch to the upload tab, select a file, and click "Transcribe"

4. View the transcription results displayed on the page

## API Endpoints

- `POST /api/transcriptions/`: Submit audio for transcription
  - Accepts multipart/form-data with an audio file
  - Returns transcription text and status

- `GET /api/transcriptions/`: List all transcriptions
  - Returns a list of all transcription records

## Error Handling

The system handles several types of errors:

- Unsupported file formats
- Corrupted audio files
- Network issues with AssemblyAI
- Speech recognition failures

All errors are properly reported to the user interface with helpful messages.

## How It Works

1. **Audio Input**: The system accepts either recorded audio or uploaded files
2. **Format Conversion**: pydub converts any format to proper WAV format
3. **Transcription Engine Selection**:
   - If AssemblyAI API key is available, it uses cloud transcription
   - Otherwise, it falls back to local speech_recognition
4. **Processing**: Audio is processed and converted to text
5. **Result Display**: Transcription text is returned to the UI

## Future Improvements

1. **Enhanced Transcription Quality**:
   - Implement noise reduction preprocessing
   - Add speaker diarization (identify different speakers)
   - Support for specialized vocabularies or domains

2. **User Experience**:
   - Real-time transcription streaming during recording
   - Progress indicators for longer files
   - Interactive transcript editor for corrections
   - Save and edit transcript history

3. **Performance Optimizations**:
   - Background processing for large files
   - Caching mechanism for previously processed audio
   - Chunked processing for very large files

4. **Additional Features**:
   - Multi-language support and language detection
   - Timestamp generation for each sentence or paragraph
   - Sentiment analysis integration
   - Export options (TXT, SRT, DOCX, etc.)
   - Audio/video bookmarking based on transcript content

5. **Advanced Integrations**:
   - Multiple transcription API options (Google, Azure, etc.)
   - Integration with content management systems
   - Automated summarization of transcripts
   - Keyword extraction and topic modeling

6. **Security Enhancements**:
   - End-to-end encryption for sensitive audio content
   - Enhanced access controls for shared transcriptions
   - Compliance features for regulated industries

7. **Deployment & Scaling**:
   - Containerization with Docker
   - CI/CD pipeline setup
   - Load balancing for high-traffic implementations
   - Dedicated worker processes for transcription tasks

## Acknowledgements

- [SpeechRecognition](https://github.com/Uberi/speech_recognition)
- [pydub](https://github.com/jiaaro/pydub)
- [AssemblyAI](https://www.assemblyai.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)