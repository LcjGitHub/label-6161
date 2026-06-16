import axios from "axios";
import type { Stairs, StairsFormData, Checkin, CheckinFormData, StairsStats, Favorite, FavoriteWithStairs } from "../types/stairs";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取台阶列表，可选城市筛选
 * @param city - 城市名称
 */
export async function fetchStairs(city?: string): Promise<Stairs[]> {
  const params = city ? { city } : {};
  const { data } = await api.get<Stairs[]>("/stairs", { params });
  return data;
}

/** 获取城市列表 */
export async function fetchCities(): Promise<string[]> {
  const { data } = await api.get<string[]>("/cities");
  return data;
}

/**
 * 获取台阶详情
 * @param id - 台阶 ID
 */
export async function fetchStairsById(id: number): Promise<Stairs> {
  const { data } = await api.get<Stairs>(`/stairs/${id}`);
  return data;
}

/**
 * 创建台阶打卡点
 * @param payload - 表单数据
 */
export async function createStairs(payload: StairsFormData): Promise<Stairs> {
  const { data } = await api.post<Stairs>("/stairs", payload);
  return data;
}

/**
 * 更新台阶打卡点
 * @param id - 台阶 ID
 * @param payload - 表单数据
 */
export async function updateStairs(
  id: number,
  payload: Partial<StairsFormData>,
): Promise<Stairs> {
  const { data } = await api.put<Stairs>(`/stairs/${id}`, payload);
  return data;
}

/**
 * 删除台阶打卡点
 * @param id - 台阶 ID
 */
export async function deleteStairs(id: number): Promise<void> {
  await api.delete(`/stairs/${id}`);
}

export async function fetchCheckins(stairsId: number): Promise<Checkin[]> {
  const { data } = await api.get<Checkin[]>(`/stairs/${stairsId}/checkins`);
  return data;
}

export async function createCheckin(payload: CheckinFormData): Promise<Checkin> {
  const { data } = await api.post<Checkin>("/checkins", payload);
  return data;
}

/** 获取台阶数据统计概览 */
export async function fetchStats(): Promise<StairsStats> {
  const { data } = await api.get<StairsStats>("/stats");
  return data;
}

/** 获取全部收藏列表（含台阶详情） */
export async function fetchFavorites(): Promise<FavoriteWithStairs[]> {
  const { data } = await api.get<FavoriteWithStairs[]>("/favorites");
  return data;
}

/**
 * 查询指定台阶是否已收藏
 * @param stairsId - 台阶编号
 */
export async function fetchFavoriteStatus(stairsId: number): Promise<Favorite | null> {
  const { data } = await api.get<Favorite | null>(`/stairs/${stairsId}/favorite`);
  return data;
}

/**
 * 添加收藏
 * @param stairsId - 台阶编号
 */
export async function createFavorite(stairsId: number): Promise<Favorite> {
  const { data } = await api.post<Favorite>("/favorites", { stairs_id: stairsId });
  return data;
}

/**
 * 取消收藏
 * @param stairsId - 台阶编号
 */
export async function deleteFavorite(stairsId: number): Promise<void> {
  await api.delete(`/favorites/${stairsId}`);
}
