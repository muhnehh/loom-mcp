export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends Entity {
  email: string;
  username: string;
  profile: UserProfile;
  role: 'admin' | 'moderator' | 'user' | 'guest';
  preferences: UserPreferences;
  status: 'active' | 'suspended' | 'banned';
  lastLoginAt: Date;
  loginCount: number;
}

export interface UserProfile {
  displayName: string;
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  socialLinks: SocialLinks;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showActivity: boolean;
  allowAnalytics: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

export interface Post extends Entity {
  authorId: string;
  content: string;
  title?: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  format: 'html' | 'markdown' | 'plain';
  categoryIds: string[];
  tags: string[];
  meta: PostMeta;
  stats: PostStats;
}

export interface PostMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface PostStats {
  views: number;
  uniqueViews: number;
  likes: number;
  shares: number;
  comments: number;
}

export interface Category extends Entity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  order: number;
  postCount: number;
}

export interface Comment extends Entity {
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  upvotes: number;
  downvotes: number;
}

export interface Media extends Entity {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Tag extends Entity {
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface Notification extends Entity {
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  readAt?: Date;
}

export class UserService {
  async create(data: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findAll(filters: UserFilters): Promise<User[]> {
    throw new Error('Not implemented');
  }

  async count(filters: UserFilters): Promise<number> {
    throw new Error('Not implemented');
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendPasswordResetEmail(userId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

export interface UserFilters {
  role?: 'admin' | 'moderator' | 'user' | 'guest';
  status?: 'active' | 'suspended' | 'banned';
  verified?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class PostService {
  async create(data: Partial<Post>): Promise<Post> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Post | null> {
    throw new Error('Not implemented');
  }

  async findBySlug(slug: string): Promise<Post | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findAll(filters: PostFilters): Promise<Post[]> {
    throw new Error('Not implemented');
  }

  async count(filters: PostFilters): Promise<number> {
    throw new Error('Not implemented');
  }

  async publish(id: string): Promise<Post> {
    throw new Error('Not implemented');
  }

  async unpublish(id: string): Promise<Post> {
    throw new Error('Not implemented');
  }

  async like(postId: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async unlike(postId: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

export interface PostFilters {
  authorId?: string;
  status?: 'draft' | 'published' | 'archived';
  categoryId?: string;
  tag?: string;
  search?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  sortBy?: 'createdAt' | 'publishedAt' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class CategoryService {
  async create(data: Partial<Category>): Promise<Category> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Category | null> {
    throw new Error('Not implemented');
  }

  async findBySlug(slug: string): Promise<Category | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<Category[]> {
    throw new Error('Not implemented');
  }

  async getTree(): Promise<CategoryTree[]> {
    throw new Error('Not implemented');
  }
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export class CommentService {
  async create(data: Partial<Comment>): Promise<Comment> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Comment | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<Comment>): Promise<Comment> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findByPostId(postId: string, filters?: CommentFilters): Promise<Comment[]> {
    throw new Error('Not implemented');
  }

  async countByPostId(postId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  async approve(id: string): Promise<Comment> {
    throw new Error('Not implemented');
  }

  async reject(id: string): Promise<Comment> {
    throw new Error('Not implemented');
  }
}

export interface CommentFilters {
  status?: 'pending' | 'approved' | 'spam' | 'deleted';
  authorId?: string;
  parentId?: string;
}

export const userService = new UserService();
export const postService = new PostService();
export const categoryService = new CategoryService();
export const commentService = new CommentService();