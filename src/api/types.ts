export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: ApiValidationError[];
  timestamp?: string;
  path?: string;
}

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MODERATOR';

export interface User {
  id: number;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  avatarUrl?: string | null;
  bio?: string | null;
  secondaryPhone?: string | null;
  isProfileCompleted?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
}

export interface RegisterResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface DistrictSummary {
  division: string;
  district: string;
  thanaCount: number;
}

export interface Thana {
  id: number;
  division: string;
  district: string;
  thana: string;
  isActive?: boolean;
}

export interface ItemMedia {
  mediaId: number;
  fileUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'OPEN' | 'CLAIM_PENDING' | 'RESOLVED' | 'EXPIRED' | 'ARCHIVED';

export interface Item {
  id: number;
  type: ItemType;
  status: ItemStatus;
  title: string;
  description?: string;
  descriptionSnippet?: string;
  specificLocationHint?: string;
  incidentDateTime: string;
  category?: Category;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  categoryIcon?: string;
  location?: Thana;
  locationId?: number;
  division?: string;
  district?: string;
  thana?: string;
  secretIdentifierQuestion?: string;
  tags?: string[];
  media?: ItemMedia[];
  primaryImageUrl?: string;
  hasSecretQuestion?: boolean;
  viewCount?: number;
  posterId?: number;
  posterName?: string;
  posterAvatarUrl?: string | null;
  isOwner?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ItemCreateRequest {
  type: ItemType;
  categoryId: number;
  locationId: number;
  title: string;
  description?: string;
  specificLocationHint?: string;
  incidentDateTime: string;
  secretIdentifierQuestion?: string;
  secretIdentifierAnswer?: string;
  tags?: string[];
  mediaIds?: number[];
  primaryMediaId?: number;
}

export interface ItemUpdateRequest {
  title?: string;
  description?: string;
  categoryId?: number;
  locationId?: number;
  specificLocationHint?: string;
  incidentDateTime?: string;
  secretIdentifierQuestion?: string;
  secretIdentifierAnswer?: string;
  tags?: string[];
  mediaIds?: number[];
  primaryMediaId?: number;
}

export interface ItemSearchParams {
  query?: string;
  type?: ItemType | 'ALL';
  categoryId?: number;
  division?: string;
  district?: string;
  thana?: string;
  status?: ItemStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'incidentDateTime' | 'viewCount' | 'title';
  sortDirection?: 'ASC' | 'DESC';
}

export interface Address {
  id: number;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  addressLine2?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  matchAlertsEnabled: boolean;
  claimAlertsEnabled: boolean;
  preferredContactMethod: 'EMAIL' | 'PHONE';
  showPhoneOnClaimApproved: boolean;
  showEmailOnClaimApproved: boolean;
  themePreference: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: 'en' | 'bn';
}

export interface DashboardOverview {
  userId: number;
  fullName: string;
  avatarUrl?: string | null;
  isProfileCompleted: boolean;
  totalAddresses: number;
  activeReportsCount: number;
  profileCompletenessPercentage: number;
}

export interface MediaUploadResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}
