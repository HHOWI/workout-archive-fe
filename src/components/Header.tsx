import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUserInfo } from "../store/slices/authSlice";
import { logoutUserAPI } from "../api/user";
import { RootState } from "../store/store";
import SearchComponent from "./SearchComponent";
import NotificationDropdown from "./common/NotificationDropdown";
import SocketService, { SocketStatus } from "../services/socketService";

// Material UI 컴포넌트
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

// Material UI 아이콘
import MenuIcon from "@mui/icons-material/Menu";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import RssFeedIcon from "@mui/icons-material/RssFeed";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const socketService = SocketService.getInstance();

  // 모바일 드로어 상태
  const [mobileOpen, setMobileOpen] = useState(false);
  // 사용자 메뉴 상태
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // 소켓 연결
  useEffect(() => {
    if (userInfo) {
      // 소켓 연결 및 인증
      socketService.connect();

      // 상태 로깅만 하는 간단한 핸들러
      const handleStatusChange = (status: SocketStatus) => {
        console.log("소켓 연결 상태:", status);
      };

      socketService.addStatusChangeHandler(handleStatusChange);

      return () => {
        socketService.removeStatusChangeHandler(handleStatusChange);
        // 컴포넌트 언마운트 시 연결 해제하지 않음 (다른 페이지에서도 사용)
      };
    }
  }, [userInfo]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUserAPI();
      dispatch(clearUserInfo());
      socketService.disconnect();
      navigate("/");
      handleCloseUserMenu();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 네비게이션 아이템 리스트
  const navItems = [
    {
      name: "피드",
      icon: <RssFeedIcon fontSize="small" />,
      path: "/feed",
      requiresAuth: true,
    },
    {
      name: "오운완",
      icon: <FitnessCenterIcon fontSize="small" />,
      path: userInfo ? `/workout-record/${userInfo.userNickname}` : "/login",
      requiresAuth: true,
    },
    {
      name: "바디로그",
      icon: <MonitorWeightIcon fontSize="small" />,
      path: userInfo ? `/body-log/${userInfo.userNickname}` : "/login",
      requiresAuth: true,
    },
    {
      name: "레코드",
      icon: <BarChartIcon fontSize="small" />,
      path: userInfo ? `/statistics/${userInfo.userNickname}` : "/login",
      requiresAuth: true,
    },
  ];

  // 모바일 드로어 컨텐츠
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontWeight: "bold",
          color: "primary.main",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        WOA
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.name}
            sx={{ justifyContent: "center" }}
            onClick={() => {
              if (!userInfo && item.requiresAuth) {
                navigate("/login");
              } else {
                navigate(item.path);
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {item.icon}
              <ListItemText primary={item.name} sx={{ ml: 1 }} />
            </Box>
          </ListItem>
        ))}
        {userInfo ? (
          <>
            <ListItem
              onClick={() => navigate(`/profile/${userInfo.userNickname}`)}
              sx={{ justifyContent: "center" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountCircleIcon fontSize="small" />
                <ListItemText primary={userInfo.userNickname} sx={{ ml: 1 }} />
              </Box>
            </ListItem>
            <ListItem onClick={handleLogout} sx={{ justifyContent: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LogoutIcon fontSize="small" />
                <ListItemText primary="로그아웃" sx={{ ml: 1 }} />
              </Box>
            </ListItem>
          </>
        ) : (
          <ListItem
            onClick={() => navigate("/login")}
            sx={{ justifyContent: "center" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LoginIcon fontSize="small" />
              <ListItemText primary="로그인" sx={{ ml: 1 }} />
            </Box>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="default"
        elevation={1}
        sx={{
          backgroundColor: "white",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* 모바일 메뉴 아이콘 */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* 로고 */}
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                cursor: "pointer",
                mr: 2,
              }}
              onClick={() => navigate("/")}
            >
              WOA
            </Typography>

            {/* 데스크탑 네비게이션 링크 */}
            {!isMobile && (
              <Box sx={{ display: "flex", flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => {
                      if (!userInfo && item.requiresAuth) {
                        navigate("/login");
                      } else {
                        navigate(item.path);
                      }
                    }}
                    sx={{
                      mr: 1,
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}

            {/* 검색창 */}
            <Box
              sx={{
                width: { xs: "auto", sm: 260 },
                marginLeft: "auto",
                marginRight: 2,
                display: { xs: isMobile ? "none" : "block", sm: "block" },
              }}
            >
              <SearchComponent />
            </Box>

            {/* 알림 아이콘 - 로그인 시에만 표시 */}
            {userInfo && <NotificationDropdown />}

            {/* 사용자 메뉴 */}
            {!isMobile && (
              <Box>
                {userInfo ? (
                  <>
                    <Button
                      color="primary"
                      sx={{ textTransform: "none" }}
                      onClick={handleOpenUserMenu}
                    >
                      {userInfo.userNickname}
                    </Button>
                    <Menu
                      sx={{ mt: "10px" }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      <MenuItem
                        onClick={() => {
                          navigate(`/profile/${userInfo.userNickname}`);
                          handleCloseUserMenu();
                        }}
                      >
                        <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography>프로필</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography>로그아웃</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  // 로그인 버튼 - 로그인되지 않은 경우
                  <Button
                    color="primary"
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate("/login")}
                    sx={{ textTransform: "none" }}
                  >
                    로그인
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* 모바일 드로어 */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 모바일 성능 향상을 위한 설정
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
