'use client';

import dynamic from 'next/dynamic';
import { JSX, useState } from 'react';
import TranscriptionHistory from './components/TranscriptionHistory';

// Dynamically import RecorderComponent with SSR disabled
const RecorderComponent = dynamic(() => import('./components/RecorderComponent'), {
  ssr: false,
});

export default function Home(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Speech to Text App</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('record')}
                className={`${
                  activeTab === 'record'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
              >
                Record Audio
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
              >
                Transcription History
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'record' ? <RecorderComponent /> : <TranscriptionHistory />}
          </div>
        </div>
      </main>
    </div>
  );
}
