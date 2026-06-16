import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
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
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { fetchCities, fetchStairs } from "../api/stairs";
import type { Stairs } from "../types/stairs";
import StairsFormModal from "../components/StairsFormModal";

export default function StairsListPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stairs, setStairs] = useState<Stairs[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cityList] = await Promise.all([
        fetchStairs(cityFilter || undefined),
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
  }, [cityFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <FormControl maxW="240px">
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
        <Button colorScheme="teal" onClick={onOpen} alignSelf="flex-end">
          新增打卡点
        </Button>
      </HStack>

      {loading ? (
        <HStack justify="center" py={12}>
          <Spinner color="teal.500" />
        </HStack>
      ) : stairs.length === 0 ? (
        <Text color="gray.500">暂无数据，点击「新增打卡点」添加。</Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>名称</Th>
                <Th>城市</Th>
                <Th isNumeric>级数</Th>
                <Th isNumeric>预估高度(m)</Th>
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
                    <Badge colorScheme={item.is_public ? "green" : "orange"}>
                      {item.is_public ? "公开" : "非公开"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      as={RouterLink}
                      to={`/stairs/${item.id}`}
                      size="sm"
                      variant="link"
                      colorScheme="teal"
                    >
                      详情
                    </Button>
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
