import type { BadgeProps } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import type { Difficulty } from "../types/stairs";

export const getDifficultyColor = (difficulty: string): string => {
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

interface DifficultyBadgeProps extends BadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty, ...rest }: DifficultyBadgeProps) {
  return (
    <Badge colorScheme={getDifficultyColor(difficulty)} {...rest}>
      {difficulty}
    </Badge>
  );
}
