import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Container,
  Stack,
  Grow,
  Fade,
  Pagination,
  AppBar,
  Toolbar,
  alpha,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { format } from 'date-fns';
import { usePosts } from '../context/PostContext';
import type { Post, PostStatus } from '../types/Post';
import { sortPostsByRecent } from '../utils/sortPosts';
import { LN, gradients } from '../theme/branding';

const placeholderImage = 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80';
const STAGGER_MS = 85;
const POSTS_PAGE_SIZE = 9;

function postCardStatusChip(status: PostStatus): { label: string; bgcolor: string; color?: string } {
  if (status === 'published') return { label: 'Live', bgcolor: 'success.main' };
  if (status === 'draft') return { label: 'Draft', bgcolor: 'warning.main' };
  return { label: 'Archived', bgcolor: 'grey.700' };
}

function readerPreviewStatusChip(status: PostStatus): { label: string; bgcolor: string; color: string } {
  if (status === 'published') {
    return { label: 'Published', bgcolor: alpha('#059669', 0.12), color: 'success.dark' };
  }
  if (status === 'draft') {
    return { label: 'Draft preview', bgcolor: alpha('#d97706', 0.12), color: 'warning.dark' };
  }
  return { label: 'Archived', bgcolor: alpha('#64748b', 0.16), color: 'text.secondary' };
}

function ReaderPreviewDialog({
  post,
  open,
  onClose,
  onEdit,
}: {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!post) return null;

  const previewStatus = readerPreviewStatusChip(post.status);
  const hasBody = post.content.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      TransitionProps={{ timeout: 400 }}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          overflow: 'hidden',
          maxHeight: fullScreen ? '100%' : '92vh',
          bgcolor: 'grey.50',
        },
      }}
    >
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, py: 1, minHeight: { xs: 56, sm: 64 } }}>
          <Chip
            icon={<ChromeReaderModeIcon sx={{ fontSize: '18px !important' }} />}
            label="Reader preview"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 12,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.dark',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, flex: 1 }}>
            This is how the article can appear to readers on your site.
          </Typography>
          <Box sx={{ flex: 1, display: { xs: 'block', sm: 'none' } }} />
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Close
          </Button>
          <Tooltip title="Close">
            <IconButton edge="end" onClick={onClose} aria-label="close preview" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="medium"
            startIcon={<EditIcon />}
            onClick={() => onEdit(post.id)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: (t) => `0 6px 20px ${alpha(t.palette.primary.main, 0.35)}`,
            }}
          >
            Edit
          </Button>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 0, bgcolor: 'grey.50' }}>
        <Fade in={open} timeout={500}>
          <Box
            className="reader-preview-article"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              bgcolor: '#fff',
              minHeight: fullScreen ? 'calc(100vh - 120px)' : 'auto',
              boxShadow: { xs: 'none', md: '0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08)' },
            }}
          >
            {(post.coverImage || placeholderImage) && (
              <Box
                component="img"
                src={post.coverImage || placeholderImage}
                alt=""
                sx={{
                  width: '100%',
                  height: { xs: 220, sm: 320 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}

            <Box sx={{ px: { xs: 3, sm: 5 }, pt: { xs: 3, sm: 4 }, pb: { xs: 5, sm: 6 } }}>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {post.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      borderColor: alpha(LN.green.main, 0.38),
                      color: 'primary.dark',
                    }}
                  />
                ))}
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '1.65rem', sm: '2.125rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: 'grey.900',
                  mb: 2,
                }}
              >
                {post.title}
              </Typography>

              {post.summary?.trim() && (
                <Typography
                  sx={{
                    fontSize: '1.125rem',
                    lineHeight: 1.65,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    borderLeft: '4px solid',
                    borderColor: 'primary.light',
                    pl: 2.5,
                    py: 0.5,
                    mb: 3,
                  }}
                >
                  {post.summary}
                </Typography>
              )}

              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                gap={2}
                sx={{ color: 'text.secondary', mb: 4 }}
              >
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <CalendarTodayIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{format(new Date(post.createdAt), 'MMMM d, yyyy')}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <AccessTimeIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{post.timeToRead} min read</Typography>
                </Stack>
                <Chip
                  label={previewStatus.label}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: previewStatus.bgcolor,
                    color: previewStatus.color,
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 4 }} />

              {hasBody ? (
                <Box
                  className="post-content"
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <Box
                  sx={{
                    py: 6,
                    px: 2,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <ArticleOutlinedIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No article body yet. Add content in the editor to see it here.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
}

export default function AllPosts() {
  const { posts, deletePost, loading, error, refreshPosts } = usePosts();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [postsPage, setPostsPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sortPostsByRecent(
      posts.filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          (p.summary ?? '').toLowerCase().includes(q) ||
          p.labels.some((l) => l.toLowerCase().includes(q));
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    );
  }, [posts, search, statusFilter]);

  const totalPostPages = Math.max(1, Math.ceil(filtered.length / POSTS_PAGE_SIZE));
  const postsPageSafe = Math.min(postsPage, totalPostPages);
  const paginatedPosts = filtered.slice((postsPageSafe - 1) * POSTS_PAGE_SIZE, postsPageSafe * POSTS_PAGE_SIZE);
  const postsRangeStart = filtered.length === 0 ? 0 : (postsPageSafe - 1) * POSTS_PAGE_SIZE + 1;
  const postsRangeEnd = Math.min(postsPageSafe * POSTS_PAGE_SIZE, filtered.length);

  useEffect(() => {
    setPostsPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setPostsPage((p) => Math.min(p, totalPostPages));
  }, [filtered.length, totalPostPages]);

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const archivedCount = posts.filter((p) => p.status === 'archived').length;

  function openMenu(e: React.MouseEvent<HTMLElement>, postId: string) {
    setAnchorEl(e.currentTarget);
    setActivePostId(postId);
  }

  function closeMenu() {
    setAnchorEl(null);
    setActivePostId(null);
  }

  function handleEdit() {
    if (activePostId) navigate(`/editor/${activePostId}`);
    closeMenu();
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  }

  async function confirmDelete() {
    if (!activePostId) return;
    try {
      await deletePost(activePostId);
    } catch {
      /* ignore — could add toast */
    }
    setDeleteDialogOpen(false);
    setActivePostId(null);
  }

  function openPreviewFromMenu() {
    const post = posts.find((p) => p.id === activePostId);
    if (post) setPreviewPost(post);
    closeMenu();
  }

  function openEditFromPreview(id: string) {
    setPreviewPost(null);
    navigate(`/editor/${id}`);
  }

  return (
    <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 0 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        {loading && <LinearProgress sx={{ borderRadius: 1 }} aria-label="Loading posts" />}
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refreshPosts()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        {/* Hero */}
        <Fade in timeout={450}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(LN.green.main, 0.35),
              bgcolor: '#ffffff',
              backgroundImage: gradients.heroWelcome,
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack spacing={1.25} sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AutoAwesomeIcon color="primary" sx={{ fontSize: 22 }} />
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.14em' }}>
                      Content library
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    All posts
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520, lineHeight: 1.65, fontWeight: 500 }}>
                    Search, filter, and open reader preview to see the full article as visitors might. List is sorted by most recently updated (same as
                    Dashboard). {posts.length} total
                    {publishedCount > 0 && ` · ${publishedCount} live`}
                    {draftCount > 0 && ` · ${draftCount} draft${draftCount !== 1 ? 's' : ''}`}
                    {archivedCount > 0 && ` · ${archivedCount} archived`}.
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/editor')}
                  sx={{
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: (t) => `0 12px 28px ${alpha(t.palette.primary.main, 0.4)}`,
                    },
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  New post
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Toolbar */}
        <Grow in timeout={500} style={{ transitionDelay: `${STAGGER_MS}ms` }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'visible' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="Search by title, summary, or label…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1.5}
                    sx={{
                      flexShrink: 0,
                      pt: { xs: 0.5, md: 0 },
                      pl: { xs: 0, md: 0.5 },
                    }}
                  >
                    {(
                      [
                        { value: 'all' as const, label: 'All' },
                        { value: 'published' as const, label: 'Published' },
                        { value: 'draft' as const, label: 'Drafts' },
                        { value: 'archived' as const, label: 'Archived' },
                      ] as const
                    ).map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={statusFilter === value ? 'contained' : 'outlined'}
                        onClick={() => setStatusFilter(value)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 2.5,
                          py: 1,
                          minWidth: 104,
                          borderRadius: 2,
                          ...(statusFilter === value
                            ? {
                                boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.3)}`,
                              }
                            : {
                                borderWidth: 1.5,
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                color: 'text.secondary',
                                '&:hover': {
                                  borderColor: 'primary.light',
                                  bgcolor: alpha(LN.green.main, 0.06),
                                },
                              }),
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filtered.length === 0 ? (
                    <>No posts match the current search or filter.</>
                  ) : filtered.length > POSTS_PAGE_SIZE ? (
                    <>
                      Showing <strong>{postsRangeStart}–{postsRangeEnd}</strong> of <strong>{filtered.length}</strong> posts
                      {search.trim() && ` matching “${search.trim()}”`} · {posts.length} total in library
                    </>
                  ) : (
                    <>
                      Showing <strong>{filtered.length}</strong> of {posts.length} posts
                      {search.trim() && ` matching “${search.trim()}”`}
                    </>
                  )}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grow>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Fade in>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <CardContent sx={{ py: 10, textAlign: 'center' }}>
                <ArticleOutlinedIcon sx={{ fontSize: 56, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No posts match
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Try another search or filter, or create a new article.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/editor')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                  New post
                </Button>
              </CardContent>
            </Card>
          </Fade>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {paginatedPosts.map((post, i) => {
              const cardSt = postCardStatusChip(post.status);
              return (
              <Grow key={post.id} in timeout={550} style={{ transitionDelay: `${(i % 9) * STAGGER_MS + STAGGER_MS * 2}ms` }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (t) => `0 16px 40px ${alpha(t.palette.primary.main, 0.1)}`,
                      borderColor: alpha(LN.green.main, 0.3),
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardActionArea onClick={() => setPreviewPost(post)}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={post.coverImage || placeholderImage}
                        alt=""
                        sx={{ height: 200, objectFit: 'cover' }}
                      />
                    </CardActionArea>
                    <Chip
                      label={cardSt.label}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: 800,
                        fontSize: 11,
                        color: '#fff',
                        bgcolor: cardSt.bgcolor,
                      }}
                    />
                    <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Tooltip title="Reader preview">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPost(post);
                          }}
                          sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
                          aria-label="reader preview"
                        >
                          <ChromeReaderModeIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More">
                        <IconButton
                          size="small"
                          onClick={(e) => openMenu(e, post.id)}
                          sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
                      {post.labels.slice(0, 3).map((label) => (
                        <Chip
                          key={label}
                          label={label}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 26,
                            fontSize: 11,
                            fontWeight: 600,
                            borderColor: alpha(LN.green.main, 0.38),
                            color: 'primary.dark',
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography
                      variant="subtitle1"
                      onClick={() => setPreviewPost(post)}
                      sx={{
                        fontWeight: 800,
                        lineHeight: 1.35,
                        mb: post.summary?.trim() ? 1 : 2,
                        cursor: 'pointer',
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {post.title}
                    </Typography>

                    {post.summary?.trim() && (
                      <Typography
                        variant="body2"
                        onClick={() => setPreviewPost(post)}
                        sx={{
                          color: 'text.secondary',
                          fontSize: 13,
                          lineHeight: 1.55,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          cursor: 'pointer',
                          flex: 1,
                        }}
                      >
                        {post.summary}
                      </Typography>
                    )}

                    <Divider sx={{ my: 'auto' }} />

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ color: 'text.secondary' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {post.timeToRead} min
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <CalendarTodayIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">{format(new Date(post.createdAt), 'MMM d, yyyy')}</Typography>
                        </Stack>
                      </Stack>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewPost(post)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Preview
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            );
            })}
          </Box>
        )}
        {filtered.length > POSTS_PAGE_SIZE && (
          <Stack alignItems="center" spacing={1.5} sx={{ pt: 1 }}>
            <Pagination
              count={totalPostPages}
              page={postsPageSafe}
              onChange={(_, p) => setPostsPage(p)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
        )}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200, mt: 0.5, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' },
        }}
      >
        <MenuItem onClick={openPreviewFromMenu} sx={{ py: 1.25, borderRadius: 1, mx: 0.5 }}>
          <ListItemIcon>
            <ChromeReaderModeIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Reader preview" secondary="Full article view" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ py: 1.25, borderRadius: 1, mx: 0.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'warning.main' }} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ py: 1.25, borderRadius: 1, mx: 0.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete this post?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This cannot be undone. The post will be removed from your library.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ReaderPreviewDialog
        post={previewPost}
        open={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        onEdit={openEditFromPreview}
      />
    </Container>
  );
}
