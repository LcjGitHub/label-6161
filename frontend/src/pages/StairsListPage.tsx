import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { fetchCities, fetchStairs } from "../api/stairs";
import type { Stairs } from "../types/stairs";
import StairsFormModal from "../components/StairsFormModal";
import { useFavorites } from "../hooks/useFavorite";
import { DifficultyBadge } from "../utils/difficulty";

export default function StairsListPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stairs, setStairs] = useState<Stairs[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [nameKeyword, setNameKeyword] = useState("");
  const [debouncedNameKeyword, setDebouncedNameKeyword] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<number | null>(null);
  const { isFavorited, toggle, isToggling, loadAll } = useFavorites();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cityList] = await Promise.all([
        fetchStairs(cityFilter || undefined, debouncedNameKeyword || undefined, difficultyFilter || undefined, sortBy || undefined),
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
  }, [cityFilter, debouncedNameKeyword, difficultyFilter, sortBy, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleNameSearch = (value: string) => {
    setNameKeyword(value);
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedNameKeyword(value);
    }, 300);
  };

  const hasFilter = cityFilter || debouncedNameKeyword || difficultyFilter;

  const handleToggleFavorite = (e: React.MouseEvent, stairsId: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(stairsId);
  };

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
          <FormLabel>难度筛选</FormLabel>
          <Select
            placeholder="全部"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
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
              {stairs.map((item) => {
                const fav = isFavorited(item.id);
                return (
                  <Tr key={item.id}>
                    <Td fontWeight="medium">{item.name}</Td>
                    <Td>{item.city}</Td>
                    <Td isNumeric>{item.step_count}</Td>
                    <Td isNumeric>{item.estimated_height}</Td>
                    <Td>
                      <DifficultyBadge difficulty={item.difficulty} />
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
                        <Button
                          size="sm"
                          colorScheme={fav ? "pink" : "gray"}
                          variant={fav ? "solid" : "outline"}
                          onClick={(e) => handleToggleFavorite(e, item.id)}
                          isLoading={isToggling(item.id)}
                          leftIcon={
                            <Text as="span" fontSize="lg">
                              {fav ? "♥" : "♡"}
                            </Text>
                          }
                        >
                          {fav ? "已收藏" : "收藏"}
                        </Button>
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
                );
              })}
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
