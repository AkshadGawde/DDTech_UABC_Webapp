import { Link } from 'react-router-dom';
import { Link as LinkIcon } from 'lucide-react';
import type { Insight } from '../../admin/services/insightsService';
import { categoryToSlug } from '../../utils/insightsHelpers';

interface InsightsSidebarProps {
  recentPosts: Insight[];
  categories: string[];
  activeCategory?: string;
  onSelectPost: (insight: Insight) => void;
  onCopyLink: (e: React.MouseEvent, insight: Insight) => void;
}

export const InsightsSidebar = ({
  recentPosts,
  categories,
  activeCategory,
  onSelectPost,
  onCopyLink,
}: InsightsSidebarProps) => {
  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-8">
      {/* Subscribe */}
      {/* <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-1">
          Subscribe to Email Updates
        </p>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4">
          Subscribe to our insights
        </h3>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all mb-3"
        />
        <button className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Subscribe
        </button>
      </div> */}

      {/* Topics / Categories */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            Topics
          </h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                <Link
                  to={`/insights/${categoryToSlug(category)}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm transition-colors font-medium ${
                    activeCategory === category
                      ? 'text-accent-600 dark:text-accent-400 underline'
                      : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400'
                  }`}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
          {activeCategory && (
            <Link
              to="/insights"
              className="mt-4 inline-block text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline"
            >
              Clear filter
            </Link>
          )}
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            Recent Posts
          </h3>
          <ul className="space-y-2.5">
            {recentPosts.map((post) => (
              <li key={post._id || post.id} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                <button
                  onClick={() => onSelectPost(post)}
                  className="flex-1 text-sm text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors text-left leading-snug"
                >
                  {post.title}
                </button>
                {post.pdfUrl && (
                  <button
                    onClick={(e) => onCopyLink(e, post)}
                    className="shrink-0 text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                    title="Copy shareable link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};
