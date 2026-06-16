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
