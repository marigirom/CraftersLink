// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ARTISAN' | 'DESIGNER';
  phone_number?: string;
  profile_image?: string;
  is_verified: boolean;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

// Artisan Types
export interface ArtisanProfile {
  id: number;
  user: User;
  business_name: string;
  bio: string;
  county: string;
  county_display?: string;
  town: string;
  craft_specialty: string;
  craft_specialty_display?: string;
  years_of_experience: number;
  workshop_address?: string;
  business_registration?: string;
  portfolio_images: string[];
  average_rating: number;
  total_commissions: number;
  created_at: string;
  updated_at: string;
  // Computed/helper fields for backward compatibility
  specialization?: string; // Maps to craft_specialty
  location?: string; // Maps to county + town
  rating?: number; // Maps to average_rating
  verified?: boolean; // Derived from business_registration
}

// Product Types
export interface Product {
  id: number;
  artisan: ArtisanProfile;
  name: string;
  description: string;
  category: string;
  price: string;
  images: ProductImage[];
  materials_used: string;
  dimensions?: string;
  weight?: string;
  customizable: boolean;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  order: number;
}

// Commission Types
export interface Commission {
  id: number;
  designer: User;
  artisan: ArtisanProfile;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string;
  reference_images: CommissionImage[];
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface CommissionImage {
  id: number;
  image: string;
  caption?: string;
}

export interface Milestone {
  id: number;
  commission: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  payment_percentage: number;
  order: number;
  completed_at?: string;
}

// Invoice Types
export interface Invoice {
  id: number;
  commission: Commission;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  line_items: InvoiceLineItem[];
  pdf_file?: string;
  created_at: string;
}

export interface InvoiceLineItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'ARTISAN' | 'DESIGNER';
  phone_number?: string;
}

export interface CommissionFormData {
  artisan_id: number;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  requirements: string;
  reference_images?: File[];
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Made with Bob
