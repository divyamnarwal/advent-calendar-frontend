import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Clock, Send, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createTimeCapsule, getPendingCapsules, getRevealedCapsules } from '../api/capsules';
import type { TimeCapsule } from '../types';

export function Capsules() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'revealed' | 'create'>('pending');
  const [pending, setPending] = useState<TimeCapsule[]>([]);
  const [revealed, setRevealed] = useState<TimeCapsule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [revealDate, setRevealDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchCapsules = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [pendingData, revealedData] = await Promise.all([
        getPendingCapsules(user.id),
        getRevealedCapsules(user.id),
      ]);
      setPending(pendingData);
      setRevealed(revealedData);
    } catch (err) {
      console.error('Failed to fetch capsules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [user]);

  // Set default reveal date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRevealDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || !revealDate) return;

    setIsLoading(true);
    setError(null);

    try {
      await createTimeCapsule({
        userId: user.id,
        content: content.trim(),
        revealDate,
      });
      setContent('');
      setActiveTab('pending');
      await fetchCapsules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create capsule');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCapsule = (capsule: TimeCapsule, isRevealed: boolean) => (
    <div
      key={capsule.id}
      className={`rounded-xl p-5 border transition-all ${
        isRevealed
          ? 'bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-800 dark:to-emerald-950/20 shadow-soft border-emerald-200 dark:border-emerald-900/50'
          : 'bg-white/70 dark:bg-gray-800/70 shadow-sm border-gray-200 dark:border-gray-700 opacity-90'
      } hover-lift`}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isRevealed
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {isRevealed ? 'Revealed' : 'Locked'}
        </span>
        {!isRevealed && <Lock size={16} className="text-gray-400 dark:text-gray-500" />}
      </div>
      <p
        className={`mb-3 leading-relaxed ${
          isRevealed ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {capsule.content}
      </p>
      <div
        className={`inline-flex items-center gap-2 text-sm ${
          isRevealed ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {isRevealed ? <Sparkles size={14} /> : <Clock size={14} />}
        {isRevealed
          ? `Revealed on ${new Date(capsule.revealDate).toLocaleDateString()}`
          : `Opens on ${new Date(capsule.revealDate).toLocaleDateString()}`}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
      <Navigation />

      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-serif mb-2">
            Time Capsules
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Send messages to your future self
          </p>
          <p className="text-sm text-violet-700/90 dark:text-violet-300/90 mb-6 bg-violet-50/70 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 rounded-lg px-4 py-2">
            What do you hope your future self remembers about this moment?
          </p>

          {/* Tabs */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full sm:w-auto items-center gap-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'pending'
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Pending ({pending.length})
              </button>
              <button
                onClick={() => setActiveTab('revealed')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'revealed'
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Revealed ({revealed.length})
              </button>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-all self-start ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-soft'
                  : 'bg-white/80 dark:bg-gray-800/80 border border-violet-200 dark:border-violet-900/50 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30'
              }`}
            >
              + New Capsule
            </button>
          </div>

          {isLoading && !activeTab ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : activeTab === 'create' ? (
            /* Create Form */
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Keep it simple. One honest sentence is enough to make this meaningful later.
              </p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Message
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Write like a quick note to yourself, not a perfect letter.
                  </p>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write something to your future self..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="revealDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reveal Date
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Choose a date when you would want this message to feel like a surprise.
                  </p>
                  <input
                    id="revealDate"
                    type="date"
                    value={revealDate}
                    onChange={(e) => setRevealDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  {isLoading ? 'Sealing Capsule...' : 'Seal Capsule'}
                </button>
              </form>
            </div>
          ) : activeTab === 'pending' ? (
            /* Pending Capsules */
            <div className="space-y-4">
              {pending.length > 0 ? (
                pending.map((c) => renderCapsule(c, false))
              ) : (
                <EmptyState
                  title="No pending capsules"
                  message="Create a time capsule to send a message to your future self!"
                  icon={<Clock size={48} className="mx-auto text-gray-300" />}
                  action={{
                    label: 'Create Capsule',
                    onClick: () => setActiveTab('create'),
                  }}
                />
              )}
            </div>
          ) : (
            /* Revealed Capsules */
            <div className="space-y-4">
              {revealed.length > 0 ? (
                revealed.map((c) => renderCapsule(c, true))
              ) : (
                <EmptyState
                  title="No revealed capsules yet"
                  message="Your capsules will be revealed on their scheduled dates."
                  icon={<Lock size={48} className="mx-auto text-gray-300" />}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
