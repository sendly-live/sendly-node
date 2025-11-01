// Message type definitions for SMS routing
export type MessageType = 'transactional' | 'marketing' | 'otp' | 'alert' | 'promotional';

export interface RoutingInfo {
  from: string;
  type: 'toll_free' | 'long_code' | 'short_code';
  reason: string;
}