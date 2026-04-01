import { useState, type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Divider,
  alpha,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { LN, gradients, LOGO_PUBLIC_PATH } from '../theme/branding';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 288;

const mainContentEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const drawerBrandEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const navItemEnter = keyframes`
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const drawerFooterEnter = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const navEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  match: (p: string) => boolean;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', path: '/', icon: <DashboardIcon />, match: (p) => p === '/' }],
  },
  {
    title: 'Publishing',
    items: [
      { label: 'New Post', path: '/editor', icon: <EditNoteIcon />, match: (p) => p.startsWith('/editor') },
      { label: 'All Posts', path: '/posts', icon: <ArticleIcon />, match: (p) => p === '/posts' },
    ],
  },
  {
    title: 'Feedback',
    items: [{ label: 'Reviews', path: '/reviews', icon: <RateReviewIcon />, match: (p) => p.startsWith('/reviews') }],
  },
  {
    title: 'People',
    items: [{ label: 'Careers', path: '/careers', icon: <WorkOutlineIcon />, match: (p) => p.startsWith('/careers') }],
  },
];

const flatNavWithIndex = navGroups.flatMap((g) => g.items);

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  let navAnimIndex = 0;

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    border: 'none',
    borderRight: '1px solid',
    borderColor: alpha(LN.silver.light, 0.12),
    bgcolor: LN.silver.deep,
    backgroundImage: gradients.sidebar,
    boxSizing: 'border-box' as const,
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.75,
          animation: `${drawerBrandEnter} 0.55s ${navEase} both`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 76,
              height: 76,
              flexShrink: 0,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'transparent',
            }}
          >
            {!logoFailed ? (
              <Box
                component="img"
                src={LOGO_PUBLIC_PATH}
                alt="Legal Notion"
                onError={() => setLogoFailed(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  boxSizing: 'border-box',
                  transform: 'scale(2.45)',
                  transformOrigin: 'center center',
                  filter: `drop-shadow(0 1px 6px ${alpha('#000', 0.35)})`,
                  transition: 'filter 0.35s ease, transform 0.35s ease',
                  '&:hover': {
                    filter: `drop-shadow(0 2px 10px ${alpha(LN.green.main, 0.45)})`,
                    transform: 'scale(2.52)',
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: gradients.logoMark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `inset 0 0 0 1px ${alpha('#fff', 0.08)}`,
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>LN</Typography>
              </Box>
            )}
          </Box>
          <Stack spacing={0.35} justifyContent="center" sx={{ flex: 1, minWidth: 0, minHeight: 76 }}>
            <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Legal Notion
            </Typography>
            <Typography sx={{ color: alpha('#94a3b8', 0.95), fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
              Admin panel
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.08), mx: 1.75 }} />

      <List disablePadding sx={{ flex: 1, px: 2, py: 2.25, overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <Box key={group.title} sx={{ mb: group.title === 'Feedback' ? 0 : 2 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                px: 1.5,
                pt: group.title === 'Overview' ? 0 : 0.5,
                pb: 1.25,
                color: alpha('#94a3b8', 0.85),
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.14em',
              }}
            >
              {group.title}
            </Typography>
            <Stack gap={0.75}>
              {group.items.map((item) => {
                const i = navAnimIndex++;
                const isActive = item.match(location.pathname);
                return (
                  <Box
                    key={item.path}
                    sx={{
                      opacity: 0,
                      animation: `${navItemEnter} 0.48s ${navEase} forwards`,
                      animationDelay: `${100 + i * 72}ms`,
                    }}
                  >
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        py: { xs: 1.5, md: 1.35 },
                        minHeight: { xs: 48, md: 'auto' },
                        px: 1.75,
                        position: 'relative',
                        overflow: 'hidden',
                        color: isActive ? '#ffffff' : '#e2e8f0',
                        bgcolor: isActive ? alpha(LN.green.main, 0.2) : 'transparent',
                        border: '1px solid',
                        borderColor: isActive ? alpha(LN.green.light, 0.45) : 'transparent',
                        transition: `background-color 0.22s ${navEase}, color 0.22s ease, border-color 0.22s ease, transform 0.22s ${navEase}, box-shadow 0.22s ease`,
                        boxShadow: isActive
                          ? `0 0 0 1px ${alpha(LN.green.main, 0.15)}, 0 6px 20px ${alpha('#000', 0.22)}`
                          : 'none',
                        ...(isActive
                          ? {
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 10,
                                bottom: 10,
                                width: 3,
                                borderRadius: '0 4px 4px 0',
                                background: `linear-gradient(180deg, ${LN.green.light} 0%, ${LN.green.main} 100%)`,
                                boxShadow: `0 0 14px ${alpha(LN.green.main, 0.55)}`,
                              },
                            }
                          : {}),
                        '&:hover': {
                          bgcolor: isActive ? alpha(LN.green.main, 0.3) : alpha('#fff', 0.06),
                          color: '#f8fafc',
                          transform: 'translateX(4px)',
                          borderColor: isActive ? alpha(LN.orange.light, 0.5) : alpha('#fff', 0.08),
                        },
                        '&:hover .MuiListItemIcon-root': {
                          color: isActive ? '#C5E1A5' : '#eceff1',
                          transform: 'scale(1.06)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 44,
                          color: isActive ? LN.green.light : alpha('#b0bec5', 0.95),
                          transition: 'color 0.2s ease, transform 0.22s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 14.5,
                          fontWeight: isActive ? 600 : 500,
                          letterSpacing: '-0.01em',
                        }}
                      />
                    </ListItemButton>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </List>

      <Box
        sx={{
          px: 2.75,
          py: 2.75,
          borderTop: '1px solid',
          borderColor: alpha('#fff', 0.08),
          opacity: 0,
          animation: `${drawerFooterEnter} 0.6s ease forwards`,
          animationDelay: `${100 + flatNavWithIndex.length * 72 + 80}ms`,
        }}
      >
        <Button
          fullWidth
          variant="text"
          startIcon={<LogoutIcon sx={{ fontSize: 20 }} />}
          onClick={() => {
            void logout().finally(() => navigate('/login', { replace: true }));
          }}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 14,
            color: alpha('#cfd8dc', 0.95),
            py: 1,
            px: 1,
            mb: 1.5,
            borderRadius: 2,
            '&:hover': {
              bgcolor: alpha('#fff', 0.06),
              color: '#fff',
            },
          }}
        >
          Sign out
        </Button>
        <Typography sx={{ color: alpha('#64748b', 0.95), fontSize: 11, fontWeight: 500, lineHeight: 1.5 }}>
          &copy; {new Date().getFullYear()} Legal Notion
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box className="flex min-h-screen" sx={{ bgcolor: '#f0f4f2' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              ...drawerPaperSx,
              width: 'min(100vw - 12px, 300px)',
              maxWidth: '100vw',
              pt: 'env(safe-area-inset-top, 0px)',
              pb: 'env(safe-area-inset-bottom, 0px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box className="flex-1 flex flex-col" sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {isMobile && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: '#fff',
              borderBottom: '1px solid #e2e8f0',
              pt: 'env(safe-area-inset-top, 0px)',
            }}
          >
            <Toolbar variant="dense" sx={{ minHeight: { xs: 48 } }}>
              <IconButton
                edge="start"
                size="large"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                sx={{ color: '#334155', ml: -0.5 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography sx={{ color: '#1e293b', fontWeight: 600, fontSize: '1.125rem', ml: 1 }}>
                Legal Notion
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box
          className="flex-1 overflow-y-auto"
          component="main"
          aria-label="Main content"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 2, sm: 3, md: 5 },
            pb: { xs: 'max(16px, env(safe-area-inset-bottom))', md: 5 },
          }}
        >
          <Box
            key={location.pathname}
            sx={{
              animation: `${mainContentEnter} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
