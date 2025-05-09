'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transcription {
  id: number;
  created_at: string;
  audio_file: string;
  transcript: string;
}

const TranscriptionHistory = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await axios.get<Transcription[]>('http://localhost:8000/api/transcriptions/');
        setTranscriptions(response.data);
        setLoading(false);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError('Error fetching transcriptions: ' + err.message);
        } else {
          setError('An unknown error occurred.');
        }
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No transcriptions available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Transcription History</h2>

      <div className="space-y-4">
        {transcriptions.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div className="mb-2">
                <p className="text-sm text-gray-500">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <audio src={item.audio_file} controls className="w-full" />
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800">{item.transcript}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptionHistory;
