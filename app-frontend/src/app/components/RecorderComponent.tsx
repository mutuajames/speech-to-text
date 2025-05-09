'use client';

import { useState, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';

const RecorderComponent = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [uploadMethod, setUploadMethod] = useState<'record' | 'upload'>('record');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        clearBlobUrl,
    } = useReactMediaRecorder({
        audio: true,
        blobPropertyBag: { type: 'audio/wav' },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          const file = files[0];
          setSelectedFile(file);
          setError('');
        }
      };
      

    const handleSubmitRecording = async () => {
        if (!mediaBlobUrl) {
            setError('Please record audio first');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setTranscript('');

        try {
            const responseBlob = await fetch(mediaBlobUrl);
            const audioBlob = await responseBlob.blob();

            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
            await submitAudioFile(audioFile);
            clearBlobUrl();
        } catch (err) {
            handleError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitFile = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setTranscript('');

        try {
            await submitAudioFile(selectedFile);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitAudioFile = async (file: string | Blob) => {
        const formData = new FormData();
        formData.append('audio_file', file);

        const response = await axios.post(
            'http://localhost:8000/api/transcriptions/transcribe_audio/',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        setTranscript(response.data.transcript);
    };

    const handleError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            setError(
                'Error submitting file for transcription: ' +
                (err.response?.data?.detail || err.message)
            );
        } else {
            setError('An unknown error occurred while submitting the file.');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl text-gray-900 font-semibold mb-4">Audio Transcription</h2>

            {/* Method Toggle */}
            <div className="mb-6">
                <div className="flex justify-center border-b border-gray-200">
                    <button
                        onClick={() => setUploadMethod('record')}
                        className={`px-4 py-2 ${uploadMethod === 'record'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500'
                            }`}
                    >
                        Record
                    </button>
                    <button
                        onClick={() => setUploadMethod('upload')}
                        className={`px-4 py-2 ${uploadMethod === 'upload'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500'
                            }`}
                    >
                        Upload File
                    </button>
                </div>
            </div>

            {/* Recording Interface */}
            {uploadMethod === 'record' && (
                <div className="mb-6">
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={startRecording}
                            disabled={status === 'recording' || isSubmitting}
                            className={`px-4 py-2 rounded-md ${status === 'recording'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            Start Recording
                        </button>

                        <button
                            onClick={stopRecording}
                            disabled={status !== 'recording' || isSubmitting}
                            className={`px-4 py-2 rounded-md ${status !== 'recording'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            Stop Recording
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Status: <span className="font-medium">{status}</span>
                        </p>
                    </div>

                    {mediaBlobUrl && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Preview</h3>
                            <audio src={mediaBlobUrl} controls className="w-full" />

                            <div className="mt-4">
                                <button
                                    onClick={handleSubmitRecording}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 rounded-md ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                >
                                    {isSubmitting ? 'Transcribing...' : 'Transcribe Recording'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* File Upload Interface */}
            {uploadMethod === 'upload' && (
                <div className="mb-6">
                    <div className="flex flex-col items-center">
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Audio or Video File
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="audio/*,video/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Supported formats: MP3, WAV, M4A, MP4, MOV, etc.
                            </p>
                        </div>

                        {selectedFile && (
                            <div className="w-full mt-2">
                                <p className="text-sm text-gray-700">
                                    Selected file: <span className="font-medium">{selectedFile.name}</span> (
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            </div>
                        )}

                        <div className="w-full mt-4">
                            <button
                                onClick={handleSubmitFile}
                                disabled={!selectedFile || isSubmitting}
                                className={`w-full px-4 py-2 rounded-md ${!selectedFile || isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Transcribing...' : 'Transcribe File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Transcript Display */}
            {transcript && (
                <div className="mt-6">
                    <h3 className="text-lg text-gray-900 font-medium mb-2">Transcription</h3>
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-900">{transcript}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecorderComponent;