export type Sport = 'football' | 'basketball' | 'tennis' | 'mma' | 'baseball' | 'hockey';
export type Market = 'match_winner' | 'over_under' | 'handicap' | 'btts' | 'double_chance';
export type EventStatus = 'scheduled' | 'live' | 'finished';

export interface BookOdd {
  book: string;
  /** Decimal odds */
  odd: number;
  /** Implied probability (1/odd) */
  impliedProb: number;
  /** EV vs consensus probability: probability * odd - 1 */
  ev: number;
  /** Whether this is the best odd available for this selection */
  isBest: boolean;
  /** Affiliate redirect URL */
  affiliateUrl: string;
}

export interface OddsSelection {
  label: string;
  books: BookOdd[];
  /** Consensus probability (devigorized average across books) */
  consensusProb: number;
  /** Best available odd */
  bestOdd: number;
  /** Best book name */
  bestBook: string;
}

export interface OddsMarket {
  market: Market;
  label: string;
  selections: OddsSelection[];
}

export interface OddsEvent {
  id: string;
  sport: Sport;
  league: string;
  home: string;
  away: string;
  startsAt: string; // ISO
  status: EventStatus;
  /** Elapsed minutes (live events) */
  elapsed?: number;
  markets: OddsMarket[];
}

export interface OddsListItem {
  id: string;
  sport: Sport;
  league: string;
  home: string;
  away: string;
  startsAt: string;
  status: EventStatus;
  elapsed?: number;
  /** Quick-view: match winner odds per book */
  winner: OddsSelection | null;
  /** Best EV available across all markets */
  bestEV: number;
}

export type RiskBand = 'negative' | 'value' | 'highlight' | 'high';
