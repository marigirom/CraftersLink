// Mock Data Utility for Dashboard Population
// This provides dummy data for testing UI/UX without backend dependencies

import { ArtisanProfile, User } from '../types';

// Mock Users for Artisans
const mockArtisanUsers: User[] = [
  {
    id: 101,
    username: 'john_woodcraft',
    email: 'john@woodcraft.co.ke',
    first_name: 'John',
    last_name: 'Kamau',
    role: 'ARTISAN',
    phone_number: '+254712345678',
    profile_image: undefined,
    is_verified: true,
    date_joined: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 102,
    username: 'mary_pottery',
    email: 'mary@ceramics.co.ke',
    first_name: 'Mary',
    last_name: 'Wanjiku',
    role: 'ARTISAN',
    phone_number: '+254723456789',
    profile_image: undefined,
    is_verified: true,
    date_joined: '2024-02-10T10:00:00Z',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 103,
    username: 'david_metalworks',
    email: 'david@metalart.co.ke',
    first_name: 'David',
    last_name: 'Ochieng',
    role: 'ARTISAN',
    phone_number: '+254734567890',
    profile_image: undefined,
    is_verified: true,
    date_joined: '2024-03-05T10:00:00Z',
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-05T10:00:00Z',
  },
  {
    id: 104,
    username: 'grace_textiles',
    email: 'grace@fabrics.co.ke',
    first_name: 'Grace',
    last_name: 'Akinyi',
    role: 'ARTISAN',
    phone_number: '+254745678901',
    profile_image: undefined,
    is_verified: true,
    date_joined: '2024-04-20T10:00:00Z',
    created_at: '2024-04-20T10:00:00Z',
    updated_at: '2024-04-20T10:00:00Z',
  },
  {
    id: 105,
    username: 'peter_leather',
    email: 'peter@leathercraft.co.ke',
    first_name: 'Peter',
    last_name: 'Mwangi',
    role: 'ARTISAN',
    phone_number: '+254756789012',
    profile_image: undefined,
    is_verified: false,
    date_joined: '2024-05-01T10:00:00Z',
    created_at: '2024-05-01T10:00:00Z',
    updated_at: '2024-05-01T10:00:00Z',
  },
];

// Mock Artisan Profiles
export const mockArtisanProfiles: ArtisanProfile[] = [
  {
    id: 1,
    user: mockArtisanUsers[0],
    business_name: 'Kamau Woodcraft',
    bio: 'Specializing in custom furniture and wooden sculptures with over 15 years of experience. Each piece tells a story.',
    county: 'NAIROBI',
    county_display: 'Nairobi',
    town: 'Westlands',
    craft_specialty: 'WOODCARVING',
    craft_specialty_display: 'Wood Carving',
    years_of_experience: 15,
    workshop_address: '123 Woodcraft Lane, Westlands',
    business_registration: 'BN-2024-001',
    portfolio_images: [],
    average_rating: 4.8,
    total_commissions: 127,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    // Backward compatibility
    specialization: 'Woodworking',
    location: 'Nairobi',
    rating: 4.8,
    verified: true,
  },
  {
    id: 2,
    user: mockArtisanUsers[1],
    business_name: 'Wanjiku Ceramics',
    bio: 'Traditional and modern pottery designs. From functional kitchenware to decorative art pieces.',
    county: 'NAKURU',
    county_display: 'Nakuru',
    town: 'Nakuru Town',
    craft_specialty: 'POTTERY',
    craft_specialty_display: 'Pottery & Ceramics',
    years_of_experience: 10,
    workshop_address: '456 Pottery Road, Nakuru',
    business_registration: 'BN-2024-002',
    portfolio_images: [],
    average_rating: 4.9,
    total_commissions: 89,
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z',
    // Backward compatibility
    specialization: 'Ceramics',
    location: 'Nakuru',
    rating: 4.9,
    verified: true,
  },
  {
    id: 3,
    user: mockArtisanUsers[2],
    business_name: 'Ochieng Metalworks',
    bio: 'Expert in wrought iron gates, sculptures, and custom metal furniture. Quality craftsmanship guaranteed.',
    county: 'KISUMU',
    county_display: 'Kisumu',
    town: 'Kisumu Central',
    craft_specialty: 'METALWORK',
    craft_specialty_display: 'Metal Crafts',
    years_of_experience: 12,
    workshop_address: '789 Metal Street, Kisumu',
    business_registration: 'BN-2024-003',
    portfolio_images: [],
    average_rating: 4.7,
    total_commissions: 95,
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-05T10:00:00Z',
    // Backward compatibility
    specialization: 'Metalwork',
    location: 'Kisumu',
    rating: 4.7,
    verified: true,
  },
  {
    id: 4,
    user: mockArtisanUsers[3],
    business_name: 'Akinyi Textiles',
    bio: 'Beautiful handwoven fabrics, traditional kikoys, and custom textile designs for home and fashion.',
    county: 'MOMBASA',
    county_display: 'Mombasa',
    town: 'Old Town',
    craft_specialty: 'TEXTILES',
    craft_specialty_display: 'Traditional Textiles',
    years_of_experience: 8,
    workshop_address: '321 Textile Avenue, Mombasa',
    business_registration: 'BN-2024-004',
    portfolio_images: [],
    average_rating: 4.6,
    total_commissions: 73,
    created_at: '2024-04-20T10:00:00Z',
    updated_at: '2024-04-20T10:00:00Z',
    // Backward compatibility
    specialization: 'Textiles',
    location: 'Mombasa',
    rating: 4.6,
    verified: true,
  },
  {
    id: 5,
    user: mockArtisanUsers[4],
    business_name: 'Mwangi Leathercraft',
    bio: 'Premium leather goods including bags, belts, and custom upholstery. Attention to detail in every stitch.',
    county: 'UASIN_GISHU',
    county_display: 'Uasin Gishu',
    town: 'Eldoret',
    craft_specialty: 'LEATHER',
    craft_specialty_display: 'Leather Crafts',
    years_of_experience: 6,
    workshop_address: '654 Leather Lane, Eldoret',
    business_registration: '',
    portfolio_images: [],
    average_rating: 4.5,
    total_commissions: 54,
    created_at: '2024-05-01T10:00:00Z',
    updated_at: '2024-05-01T10:00:00Z',
    // Backward compatibility
    specialization: 'Leatherwork',
    location: 'Eldoret',
    rating: 4.5,
    verified: false,
  },
];

// Dashboard Stats for Designer
export const mockDesignerStats = {
  activeProjects: 8,
  completedMilestones: 23,
  totalSpend: 485000,
  pendingApprovals: 3,
  averageRating: 4.7,
  savedArtisans: 12,
};

// Dashboard Stats for Artisan
export const mockArtisanStats = {
  newRequests: 5,
  activeJobs: 7,
  totalEarnings: 1250000,
  completedProjects: 45,
  averageRating: 4.8,
  responseRate: 95,
};

// Helper function to get mock artisan by ID
export const getMockArtisanById = (id: number): ArtisanProfile | undefined => {
  return mockArtisanProfiles.find(artisan => artisan.id === id);
};

// Helper function to search mock artisans
export const searchMockArtisans = (query: string): ArtisanProfile[] => {
  const lowerQuery = query.toLowerCase();
  return mockArtisanProfiles.filter(artisan =>
    artisan.business_name.toLowerCase().includes(lowerQuery) ||
    artisan.bio.toLowerCase().includes(lowerQuery) ||
    artisan.craft_specialty.toLowerCase().includes(lowerQuery) ||
    artisan.county.toLowerCase().includes(lowerQuery) ||
    artisan.town.toLowerCase().includes(lowerQuery) ||
    (artisan.specialization && artisan.specialization.toLowerCase().includes(lowerQuery)) ||
    (artisan.location && artisan.location.toLowerCase().includes(lowerQuery))
  );
};

// Helper function to filter by specialization
export const filterBySpecialization = (specialization: string): ArtisanProfile[] => {
  if (!specialization) return mockArtisanProfiles;
  return mockArtisanProfiles.filter(artisan =>
    artisan.craft_specialty === specialization || artisan.specialization === specialization
  );
};

// Helper function to filter by location
export const filterByLocation = (location: string): ArtisanProfile[] => {
  if (!location) return mockArtisanProfiles;
  return mockArtisanProfiles.filter(artisan =>
    artisan.county === location || artisan.location === location
  );
};

// Made with Bob