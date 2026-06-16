import { Box, Container, Heading, HStack, Link } from "@chakra-ui/react";
import { Link as RouterLink, Route, Routes, useLocation } from "react-router-dom";
import StairsListPage from "./pages/StairsListPage";
import StairsDetailPage from "./pages/StairsDetailPage";
import StatisticsPage from "./pages/StatisticsPage";
import FavoritesPage from "./pages/FavoritesPage";

function NavLink({
  to,
  children,
  isActive,
}: {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      as={RouterLink}
      to={to}
      _hover={{ textDecoration: "none" }}
      fontSize="sm"
      fontWeight="medium"
      px={3}
      py={1.5}
      borderRadius="md"
      bg={isActive ? "whiteAlpha.200" : "transparent"}
      border={isActive ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent"}
    >
      {children}
    </Link>
  );
}

export default function App() {
  const location = useLocation();
  const isListActive = location.pathname === "/" || location.pathname.startsWith("/stairs/");
  const isStatsActive = location.pathname === "/statistics";
  const isFavoritesActive = location.pathname === "/favorites";

  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="teal.600" color="white" py={4} shadow="sm">
        <Container maxW="container.lg">
          <HStack justify="space-between">
            <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
              <Heading size="md">城市台阶打卡点</Heading>
            </Link>
            <HStack spacing={2}>
              <NavLink to="/" isActive={isListActive}>
                打卡点列表
              </NavLink>
              <NavLink to="/favorites" isActive={isFavoritesActive}>
                我的收藏
              </NavLink>
              <NavLink to="/statistics" isActive={isStatsActive}>
                数据统计
              </NavLink>
            </HStack>
          </HStack>
        </Container>
      </Box>
      <Container maxW="container.lg" py={8}>
        <Routes>
          <Route path="/" element={<StairsListPage />} />
          <Route path="/stairs/:id" element={<StairsDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
