import React, { useEffect, useState } from 'react';
import { Page } from '../types';

// FIXED: Use environment variable for API URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface NewsDetailProps {
  newsId: string | null;
  onBack: () => void;
}

interface NewsPost {
  id: number;
  title: string;
  content: string;
  preview_text: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ newsId, onBack }) => {
  const [news, setNews] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) {
        setError('No news ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching news from:', `${API_BASE}/news-posts/${newsId}/`);
        
        const res = await fetch(`${API_BASE}/news-posts/${newsId}/`);
        
        if (!res.ok) {
          throw new Error(`News not found (${res.status})`);
        }
        
        const data = await res.json();
        setNews(data);
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError(err.message || 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-white mb-2">News Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'The news article you are looking for does not exist.'}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <div className="bg-slate-900/50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            
            <span className="text-sm text-gray-500">
              Campus News
            </span>
          </div>
        </div>
      </div>

      {/* News Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full mr-3">
              Campus News
            </span>
            <span>
              {formatDate(news.created_at)}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{news.title}</h1>
          
          {news.preview_text && (
            <p className="text-xl text-gray-300 mb-8">{news.preview_text}</p>
          )}
        </header>

        {/* Featured Image */}
        {news.image_url && (
          <div className="mb-12 rounded-2xl overflow-hidden glass border border-white/10">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-auto max-h-[600px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/600?random=1';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="mb-12">
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
            {news.content.split('\n').map((paragraph: string, index: number) => (
              paragraph.trim() ? (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(news.updated_at)}
            </div>
            
            <button
              onClick={onBack}
              className="px-6 py-3 glass text-white rounded-lg font-medium border border-white/10 hover:bg-white/5 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </footer>
      </article>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Check back regularly for more campus news, student achievements, and important announcements.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </section>
    </div>
  );
};

export default NewsDetail;