import {
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { deleteFavorite, fetchFavorites } from "../api/stairs";
import type { FavoriteWithStairs } from "../types/stairs";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [favorites, setFavorites] = useState<FavoriteWithStairs[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch {
      toast({
        title: "加载失败",
        description: "获取收藏列表失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const formatDateTime = (raw: string): string => {
    if (!raw) return raw;
    const normalized = raw.replace("T", " ");
    const match = normalized.match(
      /^(\d{4})-(\d{2})-(\d{2})\s*(\d{1,2}):(\d{2})/,
    );
    if (!match) return raw;
    const [, y, m, d, h, min] = match;
    return `${y}年${m}月${d}日 ${h}:${min}`;
  };

  const handleViewDetail = (stairsId: number) => {
    navigate(`/stairs/${stairsId}`);
  };

  const handleUnfavorite = async (stairsId: number, stairsName: string) => {
    if (!window.confirm(`确定取消收藏「${stairsName}」？`)) return;
    setDeletingId(stairsId);
    try {
      await deleteFavorite(stairsId);
      toast({ title: "已取消收藏", status: "success", duration: 2000 });
      setFavorites((prev) => prev.filter((f) => f.stairs_id !== stairsId));
    } catch {
      toast({ title: "取消收藏失败", status: "error", duration: 3000 });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner color="teal.500" />
      </HStack>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="md" shadow="sm">
      <Heading size="lg" mb={6}>
        我的收藏
      </Heading>

      {favorites.length === 0 ? (
        <VStack spacing={4} py={12}>
          <Text color="gray.500">暂无收藏的台阶</Text>
          <Button as={RouterLink} to="/" colorScheme="teal" variant="outline">
            去看看有哪些台阶
          </Button>
        </VStack>
      ) : (
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>编号</Th>
                <Th>名称</Th>
                <Th>城市</Th>
                <Th>级数</Th>
                <Th>收藏时间</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {favorites.map((fav) => (
                <Tr key={fav.id} _hover={{ bg: "gray.50" }}>
                  <Td>{fav.stairs.id}</Td>
                  <Td fontWeight="medium">{fav.stairs.name}</Td>
                  <Td>{fav.stairs.city}</Td>
                  <Td>{fav.stairs.step_count} 级</Td>
                  <Td>{formatDateTime(fav.favorite_time)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => handleViewDetail(fav.stairs_id)}
                      >
                        查看详情
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        isLoading={deletingId === fav.stairs_id}
                        onClick={() =>
                          handleUnfavorite(fav.stairs_id, fav.stairs.name)
                        }
                      >
                        取消收藏
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
