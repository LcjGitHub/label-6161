import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteStairs, fetchStairsById, fetchCheckins, createCheckin, fetchFavoriteStatus, createFavorite, deleteFavorite } from "../api/stairs";
import StairsFormModal from "../components/StairsFormModal";
import type { Stairs, Checkin, CheckinFormData } from "../types/stairs";

export default function StairsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [item, setItem] = useState<Stairs | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [form, setForm] = useState<CheckinFormData>({
    stairs_id: 0,
    checkin_time: "",
    duration_minutes: 1,
    feeling: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  const loadCheckins = useCallback(async () => {
    if (!id) return;
    setCheckinsLoading(true);
    try {
      const data = await fetchCheckins(Number(id));
      setCheckins(data);
    } catch {
      toast({
        title: "加载打卡记录失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setCheckinsLoading(false);
    }
  }, [id, toast]);

  const loadFavoriteStatus = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchFavoriteStatus(Number(id));
      setIsFavorited(!!data);
    } catch {
      setIsFavorited(false);
    }
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!id || !item) return;
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await deleteFavorite(Number(id));
        setIsFavorited(false);
        toast({ title: "已取消收藏", status: "success", duration: 2000 });
      } else {
        await createFavorite(Number(id));
        setIsFavorited(true);
        toast({ title: "收藏成功", status: "success", duration: 2000 });
      }
    } catch {
      toast({
        title: isFavorited ? "取消收藏失败" : "收藏失败",
        status: "error",
        duration: 3000,
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    loadCheckins();
    loadFavoriteStatus();
  }, [loadDetail, loadCheckins, loadFavoriteStatus]);

  useEffect(() => {
    if (id) {
      setForm((prev) => ({ ...prev, stairs_id: Number(id) }));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!form.checkin_time) {
      toast({ title: "请填写打卡日期时间", status: "warning", duration: 2000 });
      return;
    }
    if (!form.duration_minutes || form.duration_minutes < 1) {
      toast({ title: "耗时至少为 1 分钟", status: "warning", duration: 2000 });
      return;
    }
    setSubmitting(true);
    try {
      await createCheckin(form);
      toast({ title: "打卡成功", status: "success", duration: 2000 });
      setForm((prev) => ({ ...prev, checkin_time: "", duration_minutes: 1, feeling: "" }));
      loadCheckins();
    } catch {
      toast({ title: "打卡失败", status: "error", duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

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
        <HStack gap={3}>
          <Heading size="lg">{item.name}</Heading>
          <Button
            size="sm"
            colorScheme={isFavorited ? "pink" : "gray"}
            variant={isFavorited ? "solid" : "outline"}
            onClick={handleFavoriteToggle}
            isLoading={favoriteLoading}
            leftIcon={
              <Text as="span" fontSize="lg">
                {isFavorited ? "♥" : "♡"}
              </Text>
            }
          >
            {isFavorited ? "已收藏" : "收藏"}
          </Button>
        </HStack>
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

      <Divider my={8} />

      <Heading size="md" mb={4}>
        打卡记录
      </Heading>

      <VStack align="stretch" spacing={3} mb={6}>
        <HStack spacing={3} align="end" flexWrap="wrap">
          <FormControl flex="1" minW="180px">
            <FormLabel fontSize="sm">打卡日期时间</FormLabel>
            <Input
              type="datetime-local"
              value={form.checkin_time}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, checkin_time: e.target.value }))
              }
            />
          </FormControl>
          <FormControl w="120px">
            <FormLabel fontSize="sm">耗时（分钟）</FormLabel>
            <Input
              type="number"
              min={1}
              value={form.duration_minutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  duration_minutes: Number(e.target.value) || 1,
                }))
              }
            />
          </FormControl>
          <FormControl flex="1" minW="180px">
            <FormLabel fontSize="sm">简要感受</FormLabel>
            <Textarea
              value={form.feeling}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, feeling: e.target.value }))
              }
              placeholder="写下你的感受…"
              rows={2}
              resize="vertical"
            />
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={submitting}
            minW="80px"
          >
            打卡
          </Button>
        </HStack>
      </VStack>

      {checkinsLoading ? (
        <HStack justify="center" py={4}>
          <Spinner size="sm" color="teal.500" />
          <Text fontSize="sm" color="gray.500">
            加载中…
          </Text>
        </HStack>
      ) : checkins.length === 0 ? (
        <Text color="gray.500" fontSize="sm" py={4} textAlign="center">
          暂无打卡记录，快来成为第一个打卡者吧！
        </Text>
      ) : (
        <VStack align="stretch" spacing={3}>
          {checkins.map((c) => (
            <Card key={c.id} variant="outline" size="sm">
              <CardBody>
                <HStack justify="space-between" mb={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {formatDateTime(c.checkin_time)}
                  </Text>
                  <Badge colorScheme="teal">{c.duration_minutes} 分钟</Badge>
                </HStack>
                {c.feeling && (
                  <Text fontSize="sm" color="gray.600">
                    {c.feeling}
                  </Text>
                )}
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}
