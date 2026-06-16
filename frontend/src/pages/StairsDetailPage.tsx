import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteStairs, fetchStairsById } from "../api/stairs";
import StairsFormModal from "../components/StairsFormModal";
import type { Stairs } from "../types/stairs";

export default function StairsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [item, setItem] = useState<Stairs | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchStairsById(Number(id));
      setItem(data);
    } catch {
      toast({
        title: "加载失败",
        description: "未找到该打卡点或后端不可用",
        status: "error",
        duration: 4000,
      });
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleDelete = async () => {
    if (!item || !window.confirm(`确定删除「${item.name}」？`)) return;
    try {
      await deleteStairs(item.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      navigate("/");
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    }
  };

  if (loading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner color="teal.500" />
      </HStack>
    );
  }

  if (!item) {
    return (
      <VStack spacing={4}>
        <Text color="gray.500">打卡点不存在</Text>
        <Button as={RouterLink} to="/" colorScheme="teal" variant="outline">
          返回列表
        </Button>
      </VStack>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="md" shadow="sm">
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <Heading size="lg">{item.name}</Heading>
        <Badge
          fontSize="sm"
          px={3}
          py={1}
          colorScheme={item.is_public ? "green" : "orange"}
        >
          {item.is_public ? "公开" : "非公开"}
        </Badge>
      </HStack>

      <Divider mb={4} />

      <VStack align="stretch" spacing={3}>
        <HStack>
          <Text fontWeight="semibold" minW="100px">
            城市
          </Text>
          <Text>{item.city}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" minW="100px">
            级数
          </Text>
          <Text>{item.step_count} 级</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" minW="100px">
            预估高度
          </Text>
          <Text>{item.estimated_height} m</Text>
        </HStack>
        <Box>
          <Text fontWeight="semibold" mb={1}>
            备注
          </Text>
          <Text color="gray.700" whiteSpace="pre-wrap">
            {item.notes || "—"}
          </Text>
        </Box>
      </VStack>

      <HStack mt={8} spacing={3}>
        <Button as={RouterLink} to="/" variant="outline">
          返回列表
        </Button>
        <Button colorScheme="teal" onClick={onOpen}>
          编辑
        </Button>
        <Button colorScheme="red" variant="outline" onClick={handleDelete}>
          删除
        </Button>
      </HStack>

      <StairsFormModal
        isOpen={isOpen}
        onClose={onClose}
        initial={item}
        onSuccess={() => {
          onClose();
          loadDetail();
        }}
      />
    </Box>
  );
}
