import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Container,
  Stack,
  Grow,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Rating,
  alpha,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import ArticleIcon from '@mui/icons-material/Article';
import DraftsIcon from '@mui/icons-material/Drafts';
import PublishIcon from '@mui/icons-material/Publish';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { format } from 'date-fns';
import { usePosts } from '../context/PostContext';
import { useReviews } from '../context/ReviewContext';
import { useCareers } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import type { ReviewState } from '../types/Review';
import { fetchConsultationsList } from '../api/consultationsApi';
import { sortPostsByRecent } from '../utils/sortPosts';
import { LN, gradients } from '../theme/branding';

const STAGGER_MS = 90;
const RECENT_COUNT = 3;

const welcomeCardReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const welcomeFadeRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const welcomeIconGlow = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-2deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-3px) rotate(2deg);
    opacity: 0.92;
  }
`;

const listRowWelcome = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const welcomeEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function reviewStatusLabel(status: ReviewState) {
  if (status === 'needs_action') return 'Needs action';
  if (status === 'approved') return 'Approved';
  return 'Discarded';
}

export default function Dashboard() {
  const { posts } = usePosts();
  const { reviews } = useReviews();
  const { candidates } = useCareers();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greetingName = user?.email?.split('@')[0]?.trim() || 'there';
  const [consultationCount, setConsultationCount] = useState<number>(0);

  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const total = posts.length;
  const pendingCandidates = candidates.filter((c) => c.status === 'waiting').length;
  const publishedRatio = total > 0 ? Math.round((published / total) * 100) : 0;
  const draftRatio = total > 0 ? Math.round((drafts / total) * 100) : 0;

  const reviewsPending = reviews.filter((r) => r.status === 'needs_action').length;
  const reviewTotal = reviews.length;
  const pendingSharePct =
    reviewTotal > 0 ? Math.round((reviewsPending / reviewTotal) * 100) : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchConsultationsList();
        if (!cancelled) setConsultationCount(list.length);
      } catch {
        if (!cancelled) setConsultationCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: {
    label: string;
    value: string | number;
    sub: string;
    icon: ReactNode;
    color: string;
    bg: string;
    progress: number;
    onClick: () => void;
    chevronTitle: string;
  }[] = [
    {
      label: 'Free consultations',
      value: consultationCount,
      sub: consultationCount === 1 ? 'request pending' : 'requests pending',
      icon: <SupportAgentIcon sx={{ fontSize: 26 }} />,
      color: LN.orange.dark,
      bg: '#fff3e0',
      progress: consultationCount > 0 ? Math.min(100, consultationCount * 10) : 0,
      onClick: () => navigate('/consultations'),
      chevronTitle: 'Open consultations',
    },
    {
      label: 'Reviews — needs action',
      value: reviewsPending,
      sub:
        reviewsPending === 0
          ? 'queue is clear'
          : reviewTotal
            ? `${pendingSharePct}% of all reviews in the system`
            : 'awaiting approve or discard',
      icon: <PendingActionsIcon sx={{ fontSize: 26 }} />,
      color: '#d97706',
      bg: '#fef3c7',
      progress: reviewTotal > 0 ? Math.min(100, Math.round((reviewsPending / reviewTotal) * 100)) : reviewsPending > 0 ? 100 : 0,
      onClick: () => navigate('/reviews'),
      chevronTitle: 'Open reviews',
    },
    {
      label: 'Pending candidates',
      value: pendingCandidates,
      sub: pendingCandidates === 1 ? 'candidate awaiting review' : 'candidates awaiting review',
      icon: <WorkOutlineIcon sx={{ fontSize: 26 }} />,
      color: LN.green.dark,
      bg: '#e8f5e9',
      progress: pendingCandidates > 0 ? Math.min(100, pendingCandidates * 10) : 0,
      onClick: () => navigate('/careers'),
      chevronTitle: 'Open careers',
    },
    {
      label: 'Drafts',
      value: drafts,
      sub: total ? `${draftRatio}% in progress` : 'start writing',
      icon: <DraftsIcon sx={{ fontSize: 26 }} />,
      color: '#d97706',
      bg: '#fef3c7',
      progress: draftRatio,
      onClick: () => navigate('/posts'),
      chevronTitle: 'Open all posts',
    },
    {
      label: 'Published',
      value: published,
      sub: total ? `${publishedRatio}% of all posts` : 'nothing live yet',
      icon: <PublishIcon sx={{ fontSize: 26 }} />,
      color: '#059669',
      bg: '#d1fae5',
      progress: publishedRatio,
      onClick: () => navigate('/posts'),
      chevronTitle: 'Open all posts',
    },
  ];

  const recentPosts = useMemo(() => sortPostsByRecent(posts).slice(0, RECENT_COUNT), [posts]);

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_COUNT);

  return (
    <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 0 } }}>
      <Stack spacing={{ xs: 4, md: 5 }}>
        {/* Welcome */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(LN.green.main, 0.35),
            bgcolor: '#ffffff',
            backgroundImage: gradients.heroWelcome,
            animation: `${welcomeCardReveal} 0.9s ${welcomeEase} forwards`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    opacity: 0,
                    animation: `${welcomeFadeRise} 0.7s ${welcomeEase} forwards`,
                    animationDelay: '0.12s',
                  }}
                >
                  <AutoAwesomeIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 22,
                      animation: `${welcomeIconGlow} 4s ease-in-out infinite`,
                      animationDelay: '0.85s',
                    }}
                  />
                  <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em', fontWeight: 700 }}>
                    Overview
                  </Typography>
                </Stack>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                    opacity: 0,
                    animation: `${welcomeFadeRise} 0.72s ${welcomeEase} forwards`,
                    animationDelay: '0.22s',
                  }}
                >
                  Dashboard
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    maxWidth: 520,
                    lineHeight: 1.65,
                    fontWeight: 500,
                    opacity: 0,
                    animation: `${welcomeFadeRise} 0.75s ${welcomeEase} forwards`,
                    animationDelay: '0.32s',
                  }}
                >
                  Welcome back{greetingName !== 'there' ? `, ${greetingName}` : ''}. Track posts, drafts, reading time, and the latest client reviews — open All posts or Reviews for the full lists.
                </Typography>
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  flexShrink: 0,
                  opacity: 0,
                  animation: `${welcomeFadeRise} 0.75s ${welcomeEase} forwards`,
                  animationDelay: '0.42s',
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    void logout().finally(() => navigate('/login', { replace: true }));
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    py: 1.25,
                    borderRadius: 2,
                    borderWidth: 2,
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                  }}
                >
                  Sign out
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/editor')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
                    '&:hover': {
                      boxShadow: (t) => `0 12px 28px ${alpha(t.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'box-shadow 0.28s ease, transform 0.22s ease',
                  }}
                >
                  New Post
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {stats.map((stat, i) => (
            <Grow in timeout={600} key={stat.label} style={{ transitionDelay: `${i * STAGGER_MS}ms` }}>
              <Card
                elevation={0}
                onClick={stat.onClick}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (t) => `0 16px 40px ${alpha(t.palette.primary.main, 0.1)}`,
                    borderColor: alpha(LN.green.main, 0.28),
                  },
                  '&:active': { transform: 'translateY(-1px)' },
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: stat.bg,
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Tooltip title={stat.chevronTitle}>
                        <IconButton size="small" sx={{ color: 'text.disabled', mt: -0.5 }}>
                          <ChevronRightIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5, letterSpacing: '-0.02em' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: 13 }}>
                        {stat.sub}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(stat.color, 0.12),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: stat.color,
                          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>

        {/* Recent posts + reviews */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: { xs: 3, md: 3.5 },
            alignItems: 'stretch',
          }}
        >
          <Grow in timeout={700} style={{ transitionDelay: `${stats.length * STAGGER_MS}ms` }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3.5 },
                  py: { xs: 2.5, sm: 3 },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (t) => alpha(t.palette.grey[50], 0.8),
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Recent posts
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Same order as All posts: most recently updated first
                    </Typography>
                  </Stack>
                  <Button
                    onClick={() => navigate('/posts')}
                    endIcon={<ChevronRightIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    More posts
                  </Button>
                </Stack>
              </Box>

              {recentPosts.length === 0 ? (
                <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
                  <ArticleIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                    No posts yet. Create your first article.
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/editor')} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                    Create post
                  </Button>
                </Box>
              ) : (
                <List disablePadding sx={{ py: 1 }}>
                  {recentPosts.map((post, idx) => (
                    <Box
                      key={post.id}
                      sx={{
                        opacity: 0,
                        animation: `${listRowWelcome} 0.55s ${welcomeEase} forwards`,
                        animationDelay: `${380 + idx * 85}ms`,
                      }}
                    >
                        <ListItem
                          disablePadding
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            minWidth: 0,
                            gap: 0,
                            transition: 'background-color 0.25s ease',
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                            },
                          }}
                        >
                          <ListItemButton
                            onClick={() => navigate(`/editor/${post.id}`)}
                            sx={{
                              flex: '1 1 0%',
                              minWidth: 0,
                              maxWidth: '100%',
                              alignItems: 'flex-start',
                              py: { xs: 2, sm: 2.5 },
                              pl: { xs: 2.5, sm: 3.5 },
                              pr: { xs: 2, sm: 2.5 },
                              gap: 2,
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                              },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 72, flexShrink: 0, mt: 0.5 }}>
                              {post.coverImage ? (
                                <Avatar
                                  variant="rounded"
                                  src={post.coverImage}
                                  alt=""
                                  sx={{ width: 64, height: 64, borderRadius: 2, boxShadow: 1 }}
                                />
                              ) : (
                                <Avatar variant="rounded" sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'grey.100', color: 'text.secondary' }}>
                                  <ArticleIcon />
                                </Avatar>
                              )}
                            </ListItemAvatar>
                            <ListItemText
                              sx={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    lineHeight: 1.35,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {post.title}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={1} sx={{ mt: 0.75, minWidth: 0 }}>
                                  {post.summary?.trim() && (
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      sx={{
                                        color: 'text.secondary',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        lineHeight: 1.5,
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {post.summary}
                                    </Typography>
                                  )}
                                  <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
                                    {post.labels.slice(0, 3).map((l) => (
                                      <Chip
                                        key={l}
                                        label={l}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 24,
                                          fontSize: 11,
                                          fontWeight: 600,
                                          borderColor: alpha(LN.green.main, 0.4),
                                          color: 'primary.dark',
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Stack>
                              }
                              secondaryTypographyProps={{ component: 'div' }}
                            />
                          </ListItemButton>
                          <Stack
                            className="recent-post-actions"
                            alignItems="stretch"
                            spacing={1.5}
                            sx={{
                              flex: '0 0 auto',
                              alignSelf: 'stretch',
                              width: { xs: 130, sm: 148 },
                              minWidth: { xs: 130, sm: 148 },
                              maxWidth: { xs: 130, sm: 148 },
                              boxSizing: 'border-box',
                              my: { xs: 1.25, sm: 1.5 },
                              mr: { xs: 1.25, sm: 2 },
                              ml: 0.25,
                              py: 1.75,
                              px: 1.5,
                              borderRadius: 2.5,
                              border: '1px solid',
                              borderColor: (t) => alpha(t.palette.divider, 0.06),
                              bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
                              backgroundImage: (t) =>
                                `linear-gradient(145deg, ${alpha(t.palette.grey[50], 0.95)} 0%, ${alpha(t.palette.common.white, 0.5)} 100%)`,
                              boxShadow: 'none',
                              transition: 'border-color 0.28s ease, box-shadow 0.28s ease, background-color 0.28s ease',
                              '&:hover': {
                                borderColor: (t) => alpha(t.palette.primary.main, 0.45),
                                boxShadow: (t) => `0 4px 20px ${alpha(t.palette.primary.main, 0.12)}`,
                                bgcolor: (t) => alpha(t.palette.background.paper, 0.98),
                              },
                            }}
                          >
                            <Chip
                              label={
                                post.status === 'published' ? 'Live' : post.status === 'draft' ? 'Draft' : 'Archived'
                              }
                              size="small"
                              sx={{
                                alignSelf: 'flex-end',
                                fontWeight: 800,
                                fontSize: 10,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                height: 28,
                                maxWidth: '100%',
                                border: '1px solid',
                                borderColor:
                                  post.status === 'published'
                                    ? alpha('#059669', 0.35)
                                    : post.status === 'draft'
                                      ? alpha('#d97706', 0.4)
                                      : alpha('#64748b', 0.4),
                                bgcolor:
                                  post.status === 'published'
                                    ? alpha('#059669', 0.1)
                                    : post.status === 'draft'
                                      ? alpha('#d97706', 0.1)
                                      : alpha('#64748b', 0.1),
                                color:
                                  post.status === 'published'
                                    ? 'success.dark'
                                    : post.status === 'draft'
                                      ? 'warning.dark'
                                      : 'text.secondary',
                                boxShadow:
                                  post.status === 'published'
                                    ? `0 1px 0 ${alpha('#059669', 0.12)}`
                                    : post.status === 'draft'
                                      ? `0 1px 0 ${alpha('#d97706', 0.12)}`
                                      : `0 1px 0 ${alpha('#64748b', 0.12)}`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow:
                                    post.status === 'published'
                                      ? `0 2px 8px ${alpha('#059669', 0.2)}`
                                      : post.status === 'draft'
                                        ? `0 2px 8px ${alpha('#d97706', 0.2)}`
                                        : `0 2px 8px ${alpha('#64748b', 0.2)}`,
                                },
                                '& .MuiChip-label': { px: 1.25, overflow: 'hidden', textOverflow: 'ellipsis' },
                              }}
                            />
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="flex-end"
                              spacing={0.75}
                              sx={{
                                py: 0.5,
                                px: 1,
                                borderRadius: 2,
                                bgcolor: (t) => alpha(t.palette.grey[100], 0.65),
                                border: '1px solid',
                                borderColor: (t) => alpha(t.palette.divider, 0.08),
                                transition: 'border-color 0.28s ease',
                                '.recent-post-actions:hover &': {
                                  borderColor: (t) => alpha(t.palette.divider, 0.45),
                                },
                              }}
                            >
                              <TodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.9, flexShrink: 0 }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  lineHeight: 1.3,
                                  textAlign: 'right',
                                  fontVariantNumeric: 'tabular-nums',
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              justifyContent="flex-end"
                              sx={{ flexShrink: 0, pt: 0.25 }}
                            >
                              <Tooltip title="View all posts" placement="top">
                                <IconButton
                                  className="action-icon-btn"
                                  size="small"
                                  aria-label="all posts"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/posts');
                                  }}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: (t) => alpha(t.palette.divider, 0.12),
                                    bgcolor: (t) => alpha(t.palette.grey[50], 0.9),
                                    color: 'text.secondary',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.45),
                                      color: 'primary.main',
                                      transform: 'translateY(-2px)',
                                      boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.15)}`,
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                  }}
                                >
                                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit post" placement="top">
                                <IconButton
                                  className="action-icon-btn"
                                  size="small"
                                  aria-label="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/editor/${post.id}`);
                                  }}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: (t) => alpha(t.palette.primary.main, 0.12),
                                    bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                                    color: 'primary.main',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.55),
                                      transform: 'translateY(-2px)',
                                      boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.28)}`,
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                  }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </ListItem>
                        {idx < recentPosts.length - 1 && (
                          <Box sx={{ mx: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }} />
                        )}
                    </Box>
                  ))}
                </List>
              )}
            </Card>
          </Grow>

          <Grow in timeout={700} style={{ transitionDelay: `${(stats.length + 1) * STAGGER_MS}ms` }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3.5 },
                  py: { xs: 2.5, sm: 3 },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (t) => alpha(t.palette.grey[50], 0.8),
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Recent reviews
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Last {RECENT_COUNT} by activity — open Reviews to moderate
                    </Typography>
                  </Stack>
                  <Button
                    onClick={() => navigate('/reviews')}
                    endIcon={<ChevronRightIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    More reviews
                  </Button>
                </Stack>
              </Box>

              {recentReviews.length === 0 ? (
                <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
                  <RateReviewIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                    No reviews yet. They will appear here when clients submit feedback.
                  </Typography>
                  <Button variant="outlined" onClick={() => navigate('/reviews')} endIcon={<ChevronRightIcon />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                    Open Reviews
                  </Button>
                </Box>
              ) : (
                <List disablePadding sx={{ py: 1 }}>
                  {recentReviews.map((rev, idx) => (
                    <Box
                      key={rev.id}
                      sx={{
                        opacity: 0,
                        animation: `${listRowWelcome} 0.55s ${welcomeEase} forwards`,
                        animationDelay: `${480 + idx * 85}ms`,
                      }}
                    >
                        <ListItem disablePadding sx={{ alignItems: 'stretch' }}>
                          <ListItemButton
                            onClick={() => navigate('/reviews')}
                            sx={{
                              alignItems: 'flex-start',
                              py: { xs: 2, sm: 2.5 },
                              px: { xs: 2.5, sm: 3.5 },
                              gap: 2,
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: (t) => alpha(t.palette.secondary.main, 0.06),
                              },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 56, mt: 0.25 }}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  bgcolor:
                                    rev.status === 'needs_action'
                                      ? 'warning.light'
                                      : rev.status === 'approved'
                                        ? 'success.light'
                                        : 'grey.300',
                                  color:
                                    rev.status === 'needs_action' ? 'warning.dark' : rev.status === 'approved' ? 'success.dark' : 'grey.700',
                                }}
                              >
                                {initials(rev.name)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ pr: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                                    {rev.name}
                                  </Typography>
                                  <Rating value={rev.rating} readOnly size="small" sx={{ color: 'warning.main' }} />
                                </Stack>
                              }
                              secondary={
                                <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                                  <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
                                    <Chip
                                      label={reviewStatusLabel(rev.status)}
                                      size="small"
                                      sx={{
                                        height: 24,
                                        fontWeight: 700,
                                        fontSize: 11,
                                        bgcolor:
                                          rev.status === 'needs_action'
                                            ? alpha('#d97706', 0.12)
                                            : rev.status === 'approved'
                                              ? alpha('#059669', 0.12)
                                              : alpha('#64748b', 0.12),
                                        color:
                                          rev.status === 'needs_action' ? 'warning.dark' : rev.status === 'approved' ? 'success.dark' : 'text.secondary',
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                      {format(new Date(rev.updatedAt), 'MMM d, yyyy')}
                                    </Typography>
                                  </Stack>
                                  {rev.serviceUsed?.trim() && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                                      {rev.serviceUsed}
                                    </Typography>
                                  )}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {rev.review}
                                  </Typography>
                                </Stack>
                              }
                              secondaryTypographyProps={{ component: 'div' }}
                            />
                          </ListItemButton>
                        </ListItem>
                        {idx < recentReviews.length - 1 && (
                          <Box sx={{ mx: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }} />
                        )}
                    </Box>
                  ))}
                </List>
              )}
            </Card>
          </Grow>
        </Box>
      </Stack>
    </Container>
  );
}
