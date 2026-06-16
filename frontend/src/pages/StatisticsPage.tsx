import {
  Box,
  Card,
  CardBody,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchStats } from "../api/stairs";
import type { StairsStats } from "../types/stairs";

export default function StatisticsPage() {
  const toast = useToast();
  const [stats, setStats] = useState<StairsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchStats();
        setStats(data);
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
    }
    load();
  }, [toast]);

  if (loading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner color="teal.500" />
      </HStack>
    );
  }

  if (!stats) {
    return <Text color="gray.500">暂无统计数据。</Text>;
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>数据统计概览</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg="teal.50" border="1px" borderColor="teal.200">
          <CardBody>
            <Stat>
              <StatLabel color="teal.700">全部台阶总数</StatLabel>
              <StatNumber color="teal.600">{stats.total_count}</StatNumber>
              <StatHelpText>个打卡点</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="blue.50" border="1px" borderColor="blue.200">
          <CardBody>
            <Stat>
              <StatLabel color="blue.700">台阶级数平均值</StatLabel>
              <StatNumber color="blue.600">{stats.avg_step_count.toFixed(1)}</StatNumber>
              <StatHelpText>级</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="purple.50" border="1px" borderColor="purple.200">
          <CardBody>
            <Stat>
              <StatLabel color="purple.700">预估高度合计</StatLabel>
              <StatNumber color="purple.600">
                {stats.total_estimated_height.toFixed(1)}
              </StatNumber>
              <StatHelpText>米</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="orange.50" border="1px" borderColor="orange.200">
          <CardBody>
            <Stat>
              <StatLabel color="orange.700">覆盖城市数</StatLabel>
              <StatNumber color="orange.600">
                {stats.city_distribution.length}
              </StatNumber>
              <StatHelpText>个城市</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Heading size="md" mb={4}>各城市台阶数量分布</Heading>
      <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
        <Table size="md">
          <Thead bg="gray.100">
            <Tr>
              <Th>城市</Th>
              <Th isNumeric>台阶数量</Th>
              <Th isNumeric>占比</Th>
            </Tr>
          </Thead>
          <Tbody>
            {stats.city_distribution.map((item) => {
              const percentage = stats.total_count > 0
                ? ((item.count / stats.total_count) * 100).toFixed(1)
                : "0.0";
              return (
                <Tr key={item.city}>
                  <Td fontWeight="medium">{item.city}</Td>
                  <Td isNumeric>{item.count}</Td>
                  <Td isNumeric>{percentage}%</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
