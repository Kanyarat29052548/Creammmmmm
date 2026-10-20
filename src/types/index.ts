export type UserRole = 'admin' | 'moderator' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSuspended: boolean;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'pdf' | 'video' | 'website' | 'slides' | 'course' | 'other';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  educationLevel: string; // 'all' | 'primary' | 'secondary_low' | 'secondary_high' | 'university' | 'general'
  mediaType: MediaType;
  link: string;
  attachmentName?: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  isPublished: boolean;
  isHiddenByAdmin: boolean;
  viewsCount: number;
  favoritesCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: 'broken_link' | 'copyright' | 'inappropriate' | 'misinformation' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  action: string;
  targetId: string;
  targetType: 'resource' | 'user' | 'setting';
  moderatorId: string;
  moderatorEmail: string;
  details: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  announcement: string;
  isAnnouncementActive: boolean;
  categories: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
