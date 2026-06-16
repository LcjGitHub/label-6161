import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { fetchCities, fetchStairs, fetchFavorites, createFavorite, deleteFavorite } from "../api/stairs";
import type { Stairs } from "../types/stairs";
import StairsFormModal from "../components/StairsFormModal";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "简单":
      return "green";
    case "中等":
      return "yellow";
    case "困难":
      return "red";
    default:
      return "gray";
  }
};

export default function StairsListPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stairs, setStairs] = useState<Stairs[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [nameKeyword, setNameKeyword] = useState("");
  const [debouncedNameKeyword, setDebouncedNameKeyword] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await fetchFavorites();
      const ids = new Set(favs.map((f) => f.stairs_id));
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds(new Set());
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cityList] = await Promise.all([
        fetchStairs(cityFilter || undefined, debouncedNameKeyword || undefined, sortBy || undefined),
        fetchCities(),
      ]);
      setStairs(list);
      setCities(cityList);
    } catch {
      toast({
        title: "加载失败",
        description: "请确认后端服务已启动（端口 3000）",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [cityFilter, debouncedNameKeyword, sortBy, toast]);

  const handleToggleFavorite = async (stairsId: number) => {
    setTogglingId(stairsId);
    const isFav = favoriteIds.has(stairsId);
    try {
      if (isFav) {
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
        title: isFav ? "取消收藏失败" : "收藏失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    loadData();
    loadFavorites();
  }, [loadData, loadFavorites]);

  const handleNameSearch = (value: string) => {
    setNameKeyword(value);
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedNameKeyword(value);
    }, 300);
  };

  const hasFilter = cityFilter || debouncedNameKeyword;

  return (
    <Box>
      <HStack mb={6} flexWrap="wrap" gap={4} align="flex-end">
        <FormControl maxW="240px" flex="1 1 200px">
          <FormLabel>城市筛选</FormLabel>
          <Select
            placeholder="全部城市"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl maxW="240px" flex="1 1 200px">
          <FormLabel>级数排序</FormLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">默认顺序</option>
            <option value="step_count_asc">级数从少到多</option>
            <option value="step_count_desc">级数从多到少</option>
          </Select>
        </FormControl>
        <FormControl maxW="320px" flex="1 1 240px">
          <FormLabel>名称搜索</FormLabel>
          <Input
            placeholder="请输入名称关键字"
            value={nameKeyword}
            onChange={(e) => handleNameSearch(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="teal" onClick={onOpen} flexShrink={0}>
          新增打卡点
        </Button>
      </HStack>

      {loading ? (
        <HStack justify="center" py={12}>
          <Spinner color="teal.500" />
        </HStack>
      ) : stairs.length === 0 ? (
        <Text color="gray.500">
          {hasFilter ? "未找到匹配的台阶" : "暂无数据，点击「新增打卡点」添加。"}
        </Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>名称</Th>
                <Th>城市</Th>
                <Th isNumeric>级数</Th>
                <Th isNumeric>预估高度(m)</Th>
                <Th>难度</Th>
                <Th>坐标</Th>
                <Th>是否公开</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stairs.map((item) => (
                <Tr key={item.id}>
                  <Td fontWeight="medium">{item.name}</Td>
                  <Td>{item.city}</Td>
                  <Td isNumeric>{item.step_count}</Td>
                  <Td isNumeric>{item.estimated_height}</Td>
                  <Td>
                    <Badge colorScheme={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </Td>
                  <Td fontSize="sm" color="gray.600">
                    {item.longitude != null && item.latitude != null
                      ? `${item.longitude}, ${item.latitude}`
                      : "—"}
                  </Td>
                  <Td>
                    <Badge colorScheme={item.is_public ? "green" : "orange"}>
                      {item.is_public ? "公开" : "非公开"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label={favoriteIds.has(item.id) ? "取消收藏" : "收藏"}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme={favoriteIds.has(item.id) ? "pink" : "gray"}
                          aria-label={favoriteIds.has(item.id) ? "取消收藏" : "收藏"}
                          isLoading={togglingId === item.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}
                          fontSize="lg"
                        >
                          {favoriteIds.has(item.id) ? "♥" : "♡"}
                        </IconButton>
                      </Tooltip>
                      <Button
                        as={RouterLink}
                        to={`/stairs/${item.id}`}
                        size="sm"
                        variant="link"
                        colorScheme="teal"
                      >
                        详情
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <StairsFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          onClose();
          loadData();
        }}
      />
    </Box>
  );
}
