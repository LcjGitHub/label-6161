import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";
import {
  fetchFavoriteStatus,
  createFavorite,
  deleteFavorite,
  fetchFavorites,
} from "../api/stairs";

export function useFavorite(stairsId: number | null | undefined) {
  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!stairsId) return;
    setLoading(true);
    try {
      const data = await fetchFavoriteStatus(Number(stairsId));
      setIsFavorited(!!data);
    } catch {
      setIsFavorited(false);
    } finally {
      setLoading(false);
    }
  }, [stairsId]);

  const toggle = useCallback(async () => {
    if (!stairsId) return;
    setLoading(true);
    const favored = isFavorited;
    try {
      if (favored) {
        await deleteFavorite(Number(stairsId));
        setIsFavorited(false);
        toast({ title: "已取消收藏", status: "success", duration: 2000 });
      } else {
        await createFavorite(Number(stairsId));
        setIsFavorited(true);
        toast({ title: "收藏成功", status: "success", duration: 2000 });
      }
    } catch {
      toast({
        title: favored ? "取消收藏失败" : "收藏失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [stairsId, isFavorited, toast]);

  return {
    isFavorited,
    loading,
    loadStatus,
    toggle,
  };
}

export function useFavorites() {
  const toast = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const favs = await fetchFavorites();
      const ids = new Set(favs.map((f) => f.stairs_id));
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds(new Set());
      toast({
        title: "加载收藏失败",
        description: "获取收藏列表失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const isFavorited = useCallback(
    (stairsId: number) => favoriteIds.has(stairsId),
    [favoriteIds],
  );

  const toggle = useCallback(
    async (stairsId: number) => {
      setTogglingId(stairsId);
      const favored = favoriteIds.has(stairsId);
      try {
        if (favored) {
          await deleteFavorite(stairsId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(stairsId);
            return next;
          });
          toast({ title: "已取消收藏", status: "success", duration: 2000 });
        } else {
          await createFavorite(stairsId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.add(stairsId);
            return next;
          });
          toast({ title: "收藏成功", status: "success", duration: 2000 });
        }
      } catch {
        toast({
          title: favored ? "取消收藏失败" : "收藏失败",
          status: "error",
          duration: 3000,
        });
      } finally {
        setTogglingId(null);
      }
    },
    [favoriteIds, toast],
  );

  const isToggling = useCallback(
    (stairsId: number) => togglingId === stairsId,
    [togglingId],
  );

  return {
    favoriteIds,
    loading,
    loadAll,
    isFavorited,
    toggle,
    isToggling,
  };
}
