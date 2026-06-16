import { Box, Container, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink, Route, Routes } from "react-router-dom";
import StairsListPage from "./pages/StairsListPage";
import StairsDetailPage from "./pages/StairsDetailPage";

export default function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="teal.600" color="white" py={4} shadow="sm">
        <Container maxW="container.lg">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
            <Heading size="md">城市台阶打卡点</Heading>
          </Link>
        </Container>
      </Box>
      <Container maxW="container.lg" py={8}>
        <Routes>
          <Route path="/" element={<StairsListPage />} />
          <Route path="/stairs/:id" element={<StairsDetailPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
