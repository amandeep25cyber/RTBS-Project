export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'advertiser' | 'publisher';
  blocked?: boolean;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export interface AdvertiserUser extends BaseUser {
  role: 'advertiser';
  companyName: string;
  industry: string;
}

export interface PublisherUser extends BaseUser {
  role: 'publisher';
  websiteName: string;
  websiteUrl: string;
  category: string;
}

export type User = AdminUser | AdvertiserUser | PublisherUser;

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  dailyBudget: number;
  spentToday: number;
  maxBid: number;
  targeting: {
    geo: string;
    device: string;
  };
  frequencyCap: number;
  status: 'active' | 'paused' | 'archived';
}

export interface Slot {
  id: string;
  publisherId: string;
  slotName: string;
  floorPrice: number;
  fillRate: number;
  revenueToday: number;
  status: 'active' | 'inactive';
}

export interface Dsp {
  id: string;
  name: string;
  totalBids: number;
  wins: number;
  avgLatencyMs: number;
  status: 'healthy' | 'degraded' | 'down';
}

export interface AuctionEvent {
  id: string;
  winner: string;
  winningBid: number;
  latencyMs: number;
  timestamp: string;
  isNoBid: boolean;
}

export interface PlatformAnalytics {
  spendData: { hour: string; spend: number }[];
  latencyData: { hour: string; p50: number; p95: number; p99: number }[];
  winRateData: { hour: string; winRate: number }[];
}

export interface AdvertiserAnalytics {
  spendData: { hour: string; spend: number }[];
  winRateData: { hour: string; winRate: number }[];
}

export interface PublisherAnalytics {
  revenueData: { hour: string; revenue: number }[];
  fillRateData: { hour: string; fillRate: number }[];
}
