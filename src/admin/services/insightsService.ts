import { authService } from './authService';
import { getApiUrl } from '../../config/apiConfig';

const API_URL = getApiUrl();

export interface Insight {
  _id?: string;
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string; // Allow any string category instead of restricting to specific values
  tags?: string[];
  readTime?: number;
  image?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  pdfOriginalFilename?: string;
  featuredImage?: string;
  published: boolean;
  featured?: boolean;
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface InsightFilters {
  page?: number;
  limit?: number;
  status?: 'all' | 'published' | 'draft';
  category?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'updated' | 'popular';
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface InsightsResponse {
  insights: Insight[];
  pagination: PaginationInfo;
}

// Data shape for creating/updating insights from the editor
export type CreateInsightData = {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string; // Allow any string category
  image?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean; // may be ignored by backend schema
  seoTitle?: string;
  seoDescription?: string;
};

class InsightsService {
  // Get all insights (public)
  async getPublicInsights(filters: InsightFilters = {}): Promise<InsightsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      
      const url = `${API_URL}/insights?${params}`;
      console.log('Fetching from:', url);
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch insights');
      }
      
      return data.data;
    } catch (error: any) {
      console.error('Error fetching public insights:', error);
      
      // Check if error is due to abort (timeout)
      if (error.name === 'AbortError') {
        console.error('Request timeout - API took too long to respond');
      }
      
      return {
        insights: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  // Get all insights (admin)
  async getInsights(filters: InsightFilters = {}): Promise<InsightsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      
      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights/admin?${params}`
      );

      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch insights');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      return {
        insights: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  // Get all insights (alias for backward compatibility)
  async getAllInsights(filters: InsightFilters = {}): Promise<InsightsResponse> {
    // Fetch all insights without pagination limit for admin dashboard
    return this.getInsights({ ...filters, limit: 1000 });
  }

  // Get single insight by ID
  async getInsight(id: string, preview: boolean = false): Promise<Insight | null> {
    try {
      // Use admin endpoint if preview=true (for getting draft/unpublished insights)
      const url = preview 
        ? `${API_URL}/insights/admin/${id}`
        : `${API_URL}/insights/${id}`;
      
      const response = preview 
        ? await authService.makeAuthenticatedRequest(url)
        : await fetch(url);
      
      const data = await response.json();
      
      if (!data.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(data.message || 'Failed to fetch insight');
      }
      
      // Normalize the ID field
      const insight = data.data;
      if (insight._id && !insight.id) {
        insight.id = insight._id;
      }
      
      return insight;
    } catch (error) {
      console.error('Error fetching insight:', error);
      return null;
    }
  }

  async getPdfViewerUrl(id: string): Promise<string> {
    const response = await fetch(`${API_URL}/pdf-insights/${id}/pdf`);
    const data = await response.json();

    if (!response.ok || !data.success || !data.pdfUrl) {
      throw new Error(data.message || 'Failed to fetch PDF URL');
    }

    return data.pdfUrl as string;
  }

  // Create new insight
  async createInsight(data: CreateInsightData): Promise<{ success: boolean; message: string; insight?: Insight }> {
    try {
      // Sanitize payload for backend validators
      const payload: any = { ...data };
      if (typeof payload.image === 'string') {
        const img = payload.image.trim();
        // Remove if empty or data URI; backend expects a valid URL when provided
        if (!img || img.startsWith('data:')) {
          delete payload.image;
        } else {
          payload.image = img;
        }
      }
      if (!payload.tags) payload.tags = [];

      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        const firstError = Array.isArray(result.errors) && result.errors.length > 0
          ? result.errors[0].msg || result.errors[0].message
          : undefined;
        return {
          success: false,
          message: firstError || result.message || 'Failed to create insight'
        };
      }
      
      // Normalize the ID field
      const insight = result.data;
      if (insight._id && !insight.id) {
        insight.id = insight._id;
      }
      
      return {
        success: true,
        message: result.message,
        insight: insight
      };
    } catch (error) {
      console.error('Error creating insight:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // Update existing insight
  async updateInsight(id: string, data: Partial<Omit<Insight, '_id' | 'id' | 'createdAt'>>): Promise<{ success: boolean; message: string; insight?: Insight }> {
    try {
      const payload: any = { ...data };
      if (typeof payload.image === 'string') {
        const img = payload.image.trim();
        if (!img || img.startsWith('data:')) {
          delete payload.image;
        } else {
          payload.image = img;
        }
      }

      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        const firstError = Array.isArray(result.errors) && result.errors.length > 0
          ? result.errors[0].msg || result.errors[0].message
          : undefined;
        return {
          success: false,
          message: firstError || result.message || 'Failed to update insight'
        };
      }
      
      // Normalize the ID field
      const insight = result.data;
      if (insight._id && !insight.id) {
        insight.id = insight._id;
      }
      
      return {
        success: true,
        message: result.message,
        insight: insight
      };
    } catch (error) {
      console.error('Error updating insight:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // Delete insight
  async deleteInsight(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights/${id}`,
        {
          method: 'DELETE'
        }
      );
      
      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message || (result.success ? 'Insight deleted successfully' : 'Failed to delete insight')
      };
    } catch (error) {
      console.error('Error deleting insight:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // Toggle publish status
  async togglePublish(id: string, published: boolean): Promise<{ success: boolean; message: string; insight?: Insight }> {
    try {
      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights/${id}/publish`,
        {
          method: 'PATCH',
          body: JSON.stringify({ published })
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to update publish status'
        };
      }
      
      // Normalize the ID field
      const insight = result.data;
      if (insight._id && !insight.id) {
        insight.id = insight._id;
      }
      
      return {
        success: true,
        message: result.message,
        insight: insight
      };
    } catch (error) {
      console.error('Error toggling publish status:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // Backward-compat: togglePublished(id) flips current published state
  async togglePublished(id: string): Promise<{ success: boolean; message: string; insight?: Insight }> {
    const current = await this.getInsight(id, true);
    if (!current) return { success: false, message: 'Insight not found' };
    return this.togglePublish(id, !current.published);
  }

  // Toggle featured via dedicated endpoint; flips current value
  async toggleFeatured(id: string): Promise<{ success: boolean; message: string; insight?: Insight }> {
    const current = await this.getInsight(id, true);
    if (!current) return { success: false, message: 'Insight not found' };
    const next = !Boolean(current.featured);
    try {
      const response = await authService.makeAuthenticatedRequest(
        `${API_URL}/insights/${id}/featured`,
        {
          method: 'PATCH',
          body: JSON.stringify({ featured: next })
        }
      );
      const result = await response.json();
      if (!result.success) {
        return { success: false, message: result.message || 'Failed to update featured status' };
      }
      const insight = result.data;
      if (insight._id && !insight.id) insight.id = insight._id;
      return { success: true, message: result.message, insight };
    } catch (error) {
      console.error('Error toggling featured status:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  }

  // Get insights statistics
  async getInsightsStats(): Promise<{
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
    totalLikes: number;
  }> {
    try {
      // Get all insights for stats
      const response = await this.getInsights({ limit: 1000 });
      const insights = response.insights;
      
      return {
        total: insights.length,
        published: insights.filter(i => i.published).length,
        drafts: insights.filter(i => !i.published).length,
        totalViews: insights.reduce((sum, i) => sum + (i.views || 0), 0),
        totalLikes: insights.reduce((sum, i) => sum + (i.likes || 0), 0)
      };
    } catch (error) {
      console.error('Error getting insights stats:', error);
      return {
        total: 0,
        published: 0,
        drafts: 0,
        totalViews: 0,
        totalLikes: 0
      };
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<Array<{
    _id: string;
    count: number;
    totalViews: number;
    totalLikes: number;
  }>> {
    try {
      const response = await fetch(`${API_URL}/insights/categories/stats`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch category stats');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }
  }

  // Calculate read time
  calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }
}

export const insightsService = new InsightsService();