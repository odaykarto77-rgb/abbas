
import { BusinessIdea, User, Message, Agreement } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    full_name: 'Sarah Owner',
    email: 'sell@idea.com',
    password: 'password123',
    role: 'owner',
    avatar: 'https://picsum.photos/seed/sarah/200',
    rating: 4.8,
    is_verified: true,
    is_active: true,
    bio: 'Serial entrepreneur with a focus on SaaS solutions.',
    country: 'United States',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_2',
    full_name: 'Marcus Investor',
    email: 'invest@capital.com',
    password: 'password123',
    role: 'investor',
    avatar: 'https://picsum.photos/seed/marcus/200',
    rating: 4.9,
    is_verified: true,
    is_active: true,
    bio: 'Angel investor looking for disruptive FinTech concepts.',
    country: 'United Kingdom',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_admin',
    full_name: 'Admin User',
    email: 'admin@sellit.io',
    password: 'adminpassword',
    role: 'admin',
    avatar: 'https://picsum.photos/seed/admin/200',
    rating: 5.0,
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Helper to initialize the "Database" in localStorage
export const initializeDB = () => {
  if (!localStorage.getItem('sellit_users')) {
    localStorage.setItem('sellit_users', JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem('sellit_ideas')) {
    localStorage.setItem('sellit_ideas', JSON.stringify(MOCK_IDEAS));
  }
};

export const MOCK_IDEAS: BusinessIdea[] = [];

export const MOCK_MESSAGES: Message[] = [];

export const MOCK_AGREEMENTS: Agreement[] = [];
