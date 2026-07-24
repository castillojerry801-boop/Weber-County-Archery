export type MemberTier = 'adult' | 'senior_military' | 'youth';

export type MembershipType = 'monthly' | 'annual' | 'household_annual';

export type MembershipStatus = 'active' | 'expired' | 'cancelled';

export type ScanResult = 'green' | 'yellow' | 'red';

export type UserRole = 'member' | 'volunteer' | 'employee' | 'admin';

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  memberId: string;
  role: UserRole;
  createdAt: string;
};

export type Membership = {
  id: string;
  userId: string;        // primary account holder
  type: MembershipType;
  tier: MemberTier;
  status: MembershipStatus;
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  householdEmails: string[]; // additional family members by email
  squarePaymentId: string;   // TODO: Square
  createdAt: string;
};

export type PunchPass = {
  id: string;
  userId: string;
  totalPunches: 10 | 20 | 30;
  punchesRemaining: number;
  status: 'active' | 'depleted';
  squarePaymentId: string; // TODO: Square
  purchasedAt: string;
};

export type CheckInLog = {
  id: string;
  memberId: string;
  userId: string;
  passType: 'membership' | 'punch';
  result: ScanResult;
  note: string;
  checkedInAt: string;
};

// Pricing — update once Square is wired
export const MEMBERSHIP_PRICES: Record<MembershipType, Record<MemberTier, number>> = {
  monthly: { adult: 70, senior_military: 40, youth: 20 },
  annual: { adult: 175, senior_military: 130, youth: 75 },
  household_annual: { adult: 275, senior_military: 230, youth: 230 },
};

export const PUNCH_PASS_PRICES: Record<10 | 20 | 30, number> = {
  10: 45,
  20: 80,
  30: 110,
};

export const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  monthly: 'Monthly Pass',
  annual: 'Annual Pass',
  household_annual: 'Household Annual Pass',
};

export const TIER_LABELS: Record<MemberTier, string> = {
  adult: 'Adult',
  senior_military: 'Senior / Military',
  youth: 'Youth',
};
