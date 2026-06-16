/** 台阶打卡点数据类型 */

export interface Stairs {
  id: number;
  name: string;
  city: string;
  step_count: number;
  estimated_height: number;
  is_public: boolean;
  notes: string;
}

export interface StairsFormData {
  name: string;
  city: string;
  step_count: number;
  estimated_height: number;
  is_public: boolean;
  notes: string;
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
