import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Switch,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createStairs, updateStairs } from "../api/stairs";
import type { Stairs, StairsFormData } from "../types/stairs";

interface StairsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: Stairs;
}

const defaultValues: StairsFormData = {
  name: "",
  city: "",
  step_count: 100,
  estimated_height: 15,
  difficulty: "中等",
  is_public: true,
  notes: "",
};

/**
 * 台阶打卡点新增/编辑表单弹窗
 */
export default function StairsFormModal({
  isOpen,
  onClose,
  onSuccess,
  initial,
}: StairsFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StairsFormData>({ defaultValues });

  useEffect(() => {
    if (isOpen) {
      reset(
        initial
          ? {
              name: initial.name,
              city: initial.city,
              step_count: initial.step_count,
              estimated_height: initial.estimated_height,
              difficulty: initial.difficulty,
              is_public: initial.is_public,
              notes: initial.notes,
            }
          : defaultValues,
      );
    }
  }, [isOpen, initial, reset]);

  const onSubmit = async (data: StairsFormData) => {
    try {
      if (initial) {
        await updateStairs(initial.id, data);
        toast({ title: "更新成功", status: "success", duration: 2000 });
      } else {
        await createStairs(data);
        toast({ title: "创建成功", status: "success", duration: 2000 });
      }
      onSuccess();
    } catch {
      toast({ title: "操作失败", status: "error", duration: 3000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{isEdit ? "编辑打卡点" : "新增打卡点"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" gap={4}>
          <FormControl isInvalid={Boolean(errors.name)}>
            <FormLabel>名称</FormLabel>
            <Input {...register("name", { required: "请输入名称" })} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.city)}>
            <FormLabel>城市</FormLabel>
            <Input {...register("city", { required: "请输入城市" })} />
            <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
          </FormControl>

          <HStack align="flex-start">
            <FormControl isInvalid={Boolean(errors.step_count)}>
              <FormLabel>级数</FormLabel>
              <NumberInput min={1} value={watch("step_count")}>
                <NumberInputField
                  {...register("step_count", {
                    required: "请输入级数",
                    valueAsNumber: true,
                    min: { value: 1, message: "级数至少为 1" },
                  })}
                />
              </NumberInput>
              <FormErrorMessage>{errors.step_count?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.estimated_height)}>
              <FormLabel>预估高度 (m)</FormLabel>
              <NumberInput min={0} step={0.1} value={watch("estimated_height")}>
                <NumberInputField
                  {...register("estimated_height", {
                    required: "请输入预估高度",
                    valueAsNumber: true,
                    min: { value: 0, message: "高度不能为负" },
                  })}
                />
              </NumberInput>
              <FormErrorMessage>
                {errors.estimated_height?.message}
              </FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl isInvalid={Boolean(errors.difficulty)}>
            <FormLabel>难度等级</FormLabel>
            <Select
              {...register("difficulty", {
                required: "请选择难度等级",
              })}
              value={watch("difficulty")}
            >
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </Select>
            <FormErrorMessage>{errors.difficulty?.message}</FormErrorMessage>
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb={0}>是否公开</FormLabel>
            <Switch
              isChecked={watch("is_public")}
              onChange={(e) => setValue("is_public", e.target.checked)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>备注</FormLabel>
            <Textarea {...register("notes")} rows={3} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
