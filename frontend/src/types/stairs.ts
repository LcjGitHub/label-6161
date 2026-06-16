/** 台阶打卡点数据类型 */

export type Difficulty = "简单" | "中等" | "困难";

export interface Stairs {
  id: number;
  name: string;
  city: string;
  step_count: number;
  estimated_height: number;
  difficulty: Difficulty;
  is_public: boolean;
  notes: string;
  longitude: number | null;
  latitude: number | null;
}

export interface StairsFormData {
  name: string;
  city: string;
  step_count: number;
  estimated_height: number;
  difficulty: Difficulty;
  is_public: boolean;
  notes: string;
  longitude: number | null;
  latitude: number | null;
}

export interface Checkin {
  id: number;
  stairs_id: number;
  checkin_time: string;
  duration_minutes: number;
  feeling: string;
}

export interface CheckinFormData {
  stairs_id: number;
  checkin_time: string;
  duration_minutes: number;
  feeling: string;
}

export interface CityStairsCount {
  city: string;
  count: number;
}

export interface StairsStats {
  total_count: number;
  avg_step_count: number;
  total_estimated_height: number;
  city_distribution: CityStairsCount[];
}

export interface Favorite {
  id: number;
  stairs_id: number;
  favorite_time: string;
}

export interface CheckinSummary {
  total_checkins: number;
  last_checkin_time: string | null;
}

export interface FavoriteWithStairs {
  id: number;
  stairs_id: number;
  favorite_time: string;
  stairs: Stairs;
}
