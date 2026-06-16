import { Box, Container, Heading, HStack, Link } from "@chakra-ui/react";
import { Link as RouterLink, Route, Routes } from "react-router-dom";
import StairsListPage from "./pages/StairsListPage";
import StairsDetailPage from "./pages/StairsDetailPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="teal.600" color="white" py={4} shadow="sm">
        <Container maxW="container.lg">
          <HStack justify="space-between">
            <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
              <Heading size="md">城市台阶打卡点</Heading>
            </Link>
            <HStack spacing={6}>
              <Link
                as={RouterLink}
                to="/"
                _hover={{ textDecoration: "none" }}
                fontSize="sm"
                fontWeight="medium"
              >
                打卡点列表
              </Link>
              <Link
                as={RouterLink}
                to="/statistics"
                _hover={{ textDecoration: "none" }}
                fontSize="sm"
                fontWeight="medium"
              >
                数据统计
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>
      <Container maxW="container.lg" py={8}>
        <Routes>
          <Route path="/" element={<StairsListPage />} />
          <Route path="/stairs/:id" element={<StairsDetailPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
