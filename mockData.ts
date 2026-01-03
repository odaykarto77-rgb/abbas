
import { BusinessIdea, User, Message, Agreement } from './types';
import { Storage } from './services/Storage';

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

export const MOCK_IDEAS: BusinessIdea[] = [
  {
    id: 'idea_01',
    user_id: 'user_1',
    title: 'Neon Logistics Mesh',
    category: 'AI / Machine Learning',
    short_summary: 'Decentralized autonomous logistics network using edge-computing agents.',
    full_description: 'An advanced mesh network designed to optimize last-mile delivery without central server dependency. Utilizes proprietary lightweight LLMs on edge devices to route parcels in real-time through crowdsourced transit nodes.',
    required_budget: 250000,
    expected_profit_share: 15,
    monetization_model: 'Per-transaction fee',
    deal_type: 'Partnership',
    visibility: 'public',
    status: 'published',
    created_at: '2025-01-15',
    tags: ['AI', 'Logistics']
  },
  {
    id: 'idea_02',
    user_id: 'user_2',
    title: 'Green Ledger Protocol',
    category: 'Environment',
    short_summary: 'Real-time carbon offset verification via hardware-linked smart contracts.',
    full_description: 'Integrating IoT sensors with a high-throughput blockchain to provide immutable proof of carbon sequestration at the source. Solves the transparency crisis in voluntary carbon markets.',
    required_budget: 120000,
    expected_profit_share: 20,
    monetization_model: 'SaaS Subscription',
    deal_type: 'Equity Only',
    visibility: 'public',
    status: 'published',
    created_at: '2025-01-20',
    tags: ['GreenTech', 'Web3']
  },
  {
    id: 'idea_03',
    user_id: 'user_1',
    title: 'Bio-Sync Wellness',
    category: 'Biotech',
    short_summary: 'Predictive health monitoring platform utilizing non-invasive wearable telemetry.',
    full_description: 'Next-generation health diagnostic software that predicts metabolic dips before they occur, allowing for proactive intervention via automated nutritional guidance.',
    required_budget: 450000,
    expected_profit_share: 10,
    monetization_model: 'Licensing',
    deal_type: 'Fixed Price',
    visibility: 'public',
    status: 'published',
    created_at: '2025-02-01',
    tags: ['Health', 'Biotech']
  },
  {
    id: 'idea_04',
    user_id: 'user_admin',
    title: 'Cyber-Safe Retail Net',
    category: 'E-Commerce',
    short_summary: 'A localized e-commerce platform with built-in escrow and hardware-key security.',
    full_description: 'A hyper-secure marketplace for high-value physical goods. Uses a proprietary double-blind escrow system to ensure buyer/seller safety without middleman fees.',
    required_budget: 85000,
    expected_profit_share: 25,
    monetization_model: 'Escrow Fees',
    deal_type: 'Partnership',
    visibility: 'public',
    status: 'published',
    created_at: '2025-02-10',
    tags: ['Security', 'Retail']
  }
];

export const initializeDB = () => {
  if (!Storage.get('users')) {
    Storage.set('users', JSON.stringify(MOCK_USERS));
  }
  if (!Storage.get('ideas')) {
    Storage.set('ideas', JSON.stringify(MOCK_IDEAS));
  }
  if (!Storage.get('messages')) {
    Storage.set('messages', JSON.stringify([]));
  }
};

export const MOCK_MESSAGES: Message[] = [];
export const MOCK_AGREEMENTS: Agreement[] = [];
