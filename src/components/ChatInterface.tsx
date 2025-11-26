import { useState } from 'react';
import { api } from '../lib/api';
import { useSoul } from '../providers/SoulProvider';
import type { ChatResponse } from '../lib/types';

export function ChatInterface() {
  const { ownerId, soulId } = useSoul();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.chat(ownerId, soulId, {
        query: query.trim(),
        top_k: 5,
        max_tokens: 512,
        temperature: 0.7,
        include_sources: true,
      });
      setResponse(result);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {response && (
          <div className="space-y-2">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="whitespace-pre-wrap">{response.response_text}</p>
            </div>
            {response.used_docs && response.used_docs.length > 0 && (
              <div className="text-xs text-gray-500">
                <p className="font-medium">Sources:</p>
                <ul className="list-disc list-inside">
                  {response.used_docs.map((doc, i) => (
                    <li key={i}>{doc.source}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-xs text-gray-400">
              Knowledge base: {response.has_knowledge_base ? 'Yes' : 'No'} | 
              Indexed docs: {response.total_indexed_documents}
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}