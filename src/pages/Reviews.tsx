import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Rating,
  LinearProgress,
  Grow,
  Fade,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  IconButton,
  TextField,
  Pagination,
  Collapse,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import { useReviews } from '../context/ReviewContext';
import type { Review, ReviewState } from '../types/Review';
import { getApiBaseForDisplay } from '../api/apiBase';
import { gradients } from '../theme/branding';

const REVIEWS_PAGE_SIZE = 10;

type ReviewListSort = 'newest' | 'ratingHigh' | 'ratingLow';

function sortReviewsForList(list: Review[], sort: ReviewListSort): Review[] {
  const copy = [...list];
  const time = (d: string) => new Date(d).getTime();
  switch (sort) {
    case 'newest':
      copy.sort((a, b) => time(b.createdAt) - time(a.createdAt));
      break;
    case 'ratingHigh':
      copy.sort((a, b) => b.rating - a.rating || time(b.createdAt) - time(a.createdAt));
      break;
    case 'ratingLow':
      copy.sort((a, b) => a.rating - b.rating || time(b.createdAt) - time(a.createdAt));
      break;
    default:
      break;
  }
  return copy;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`reviews-tabpanel-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ReviewAnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  delay,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <Grow in timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: () => `0 12px 32px ${alpha(color, 0.12)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>
                {value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {subtitle}
              </Typography>
            </Box>
            <Avatar
              variant="rounded"
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                bgcolor: alpha(color, 0.12),
                color,
              }}
            >
              {icon}
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

function ReviewCard({
  review,
  variant,
  onApprove,
  onDiscard,
  onSaveReply,
  onSendToNeedsAction,
  onRequestDeleteReply,
  onDiscardedSendToNeedsAction,
  onDiscardedPermanentDelete,
}: {
  review: Review;
  variant: ReviewState;
  onApprove: (id: string) => void;
  onDiscard: (id: string) => void;
  onSaveReply: (id: string, reply: string) => void;
  onSendToNeedsAction?: (id: string) => void;
  onRequestDeleteReply?: (id: string) => void;
  onDiscardedSendToNeedsAction?: (id: string) => void;
  onDiscardedPermanentDelete?: (id: string) => void;
}) {
  const isNeedsAction = variant === 'needs_action';
  const isApproved = variant === 'approved';
  const isDiscarded = variant === 'discarded';

  const [replyDraft, setReplyDraft] = useState(() => review.adminReply ?? '');
  const [replyOpen, setReplyOpen] = useState(false);
  useEffect(() => {
    setReplyDraft(review.adminReply ?? '');
  }, [review.id, review.adminReply]);

  const savedReply = (review.adminReply ?? '').trim();
  const replyDirty = replyDraft.trim() !== savedReply;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: isNeedsAction ? alpha('#f59e0b', 0.35) : isApproved ? alpha('#059669', 0.2) : 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: (t) => `0 8px 28px ${alpha(t.palette.common.black, 0.06)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'flex-start' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontWeight: 800,
              bgcolor: isNeedsAction ? 'warning.light' : isApproved ? 'success.light' : 'grey.300',
              color: isNeedsAction ? 'warning.dark' : isApproved ? 'success.dark' : 'grey.700',
            }}
          >
            {initials(review.name)}
          </Avatar>

          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" flexWrap="wrap" alignItems="flex-start" gap={1} justifyContent="space-between">
              <Box>
                <Typography component="div" variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' }}>
                  Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.25 }}>
                  {review.name}
                </Typography>
              </Box>
              <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.5}>
                <Typography component="div" variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' }}>
                  Rating
                </Typography>
                <Rating value={review.rating} readOnly precision={0.5} size="small" sx={{ color: 'warning.main' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {format(new Date(review.createdAt), 'MMM d, yyyy · h:mm a')}
                </Typography>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' }}>
                    Role
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', pl: 0.25 }}>
                  {review.role?.trim() ? review.role : '—'}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <HandshakeOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' }}>
                    Service used
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', pl: 0.25 }}>
                  {review.serviceUsed?.trim() ? review.serviceUsed : '—'}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                Review
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
                  borderLeft: '4px solid',
                  borderColor: isNeedsAction ? 'warning.main' : isApproved ? 'success.main' : 'grey.400',
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                  {review.review}
                </Typography>
              </Box>
            </Box>

            {isNeedsAction && (review.adminReply ?? '').trim() ? (
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.grey[600], 0.08),
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Reply on file (from when this was approved)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {(review.adminReply ?? '').trim()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
                  Approve again to edit or remove this reply from the reply controls.
                </Typography>
              </Box>
            ) : null}

            {isNeedsAction && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => onApprove(review.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
                >
                  Approve review
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => onDiscard(review.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
                >
                  Discard
                </Button>
              </Stack>
            )}

            {isApproved && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                  <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 700 }} />
                  <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                    <Tooltip title={replyOpen ? 'Close reply editor' : savedReply ? 'Edit reply' : 'Write a reply'}>
                      <IconButton
                        color={replyOpen ? 'primary' : 'default'}
                        onClick={() => setReplyOpen((o) => !o)}
                        aria-expanded={replyOpen}
                        aria-label={replyOpen ? 'Close reply' : 'Open reply'}
                        sx={{
                          border: '1px solid',
                          borderColor: replyOpen ? 'primary.main' : 'divider',
                          bgcolor: replyOpen ? (t) => alpha(t.palette.primary.main, 0.08) : 'background.paper',
                        }}
                      >
                        <ReplyOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    {onSendToNeedsAction && (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<PendingActionsIcon />}
                        onClick={() => onSendToNeedsAction(review.id)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        Send to needs action
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {savedReply ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.success.main, 0.06),
                      border: '1px solid',
                      borderColor: (t) => alpha(t.palette.success.main, 0.2),
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} sx={{ mb: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark', letterSpacing: '0.06em' }}>
                        Your reply
                      </Typography>
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="Edit reply">
                          <IconButton
                            size="small"
                            aria-label="Edit reply"
                            onClick={() => setReplyOpen(true)}
                            sx={{ color: 'success.dark' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onRequestDeleteReply && (
                          <Tooltip title="Delete saved reply">
                            <IconButton
                              size="small"
                              aria-label="Delete reply"
                              onClick={() => onRequestDeleteReply(review.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                    <Typography variant="body2" sx={{ lineHeight: 1.65, color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                      {savedReply}
                    </Typography>
                  </Box>
                ) : null}

                <Collapse in={replyOpen} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                      border: '1px solid',
                      borderColor: (t) => alpha(t.palette.primary.main, 0.12),
                      mt: savedReply ? 1.5 : 0,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      Draft your reply; it stays in this admin panel. Send it through your usual channel (for example email).
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={12}
                      placeholder="Write your reply…"
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' },
                      }}
                    />
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<SaveOutlinedIcon />}
                        disabled={!replyDirty}
                        onClick={() => {
                          onSaveReply(review.id, replyDraft);
                          setReplyOpen(false);
                        }}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        Save reply
                      </Button>
                    </Stack>
                  </Box>
                </Collapse>
              </>
            )}

            {isDiscarded && (
              <Stack spacing={1.5} sx={{ pt: 0.25 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  Not shown publicly — discarded {format(new Date(review.updatedAt), 'MMM d, yyyy')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                  {onDiscardedSendToNeedsAction && (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      startIcon={<PendingActionsIcon />}
                      onClick={() => onDiscardedSendToNeedsAction(review.id)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
                    >
                      Send to needs action
                    </Button>
                  )}
                  {onDiscardedPermanentDelete && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={() => onDiscardedPermanentDelete(review.id)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
                    >
                      Delete permanently
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Reviews() {
  const {
    reviews,
    loading,
    error,
    refreshReviews,
    approveReview,
    discardReview,
    sendApprovedToNeedsAction,
    sendDiscardedToNeedsAction,
    permanentlyDeleteDiscarded,
    setReviewReply,
  } = useReviews();
  const [tab, setTab] = useState(0);
  const [reviewListPage, setReviewListPage] = useState(1);
  const [discardId, setDiscardId] = useState<string | null>(null);
  const [needsActionConfirmId, setNeedsActionConfirmId] = useState<string | null>(null);
  const [discardedToQueueId, setDiscardedToQueueId] = useState<string | null>(null);
  const [permanentDeleteDiscardedId, setPermanentDeleteDiscardedId] = useState<string | null>(null);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const [reviewSort, setReviewSort] = useState<ReviewListSort>('newest');
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const needsAction = useMemo(() => reviews.filter((r) => r.status === 'needs_action'), [reviews]);
  const approved = useMemo(() => reviews.filter((r) => r.status === 'approved'), [reviews]);
  const discarded = useMemo(() => reviews.filter((r) => r.status === 'discarded'), [reviews]);

  const sortedNeedsAction = useMemo(() => sortReviewsForList(needsAction, reviewSort), [needsAction, reviewSort]);
  const sortedApproved = useMemo(() => sortReviewsForList(approved, reviewSort), [approved, reviewSort]);
  const sortedDiscarded = useMemo(() => sortReviewsForList(discarded, reviewSort), [discarded, reviewSort]);

  const avgApproved = useMemo(() => {
    const a = approved;
    if (!a.length) return 0;
    return a.reduce((s, r) => s + r.rating, 0) / a.length;
  }, [approved]);

  const highRatedApproved = useMemo(() => approved.filter((r) => r.rating >= 4).length, [approved]);
  const highRatedPct = approved.length ? Math.round((highRatedApproved / approved.length) * 100) : 0;

  /** Star distribution for analytics: approved only (same basis as average rating). */
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    approved.forEach((r) => {
      const i = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[i] += 1;
    });
    const max = Math.max(...counts, 1);
    return counts.map((c, i) => ({ stars: i + 1, count: c, pct: Math.round((c / max) * 100) }));
  }, [approved]);

  async function confirmDiscard() {
    if (!discardId) return;
    try {
      await discardReview(discardId);
      setSnack({ open: true, message: 'Review discarded.', severity: 'info' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not discard review', severity: 'error' });
    }
    setDiscardId(null);
  }

  async function handleApprove(id: string) {
    try {
      await approveReview(id);
      setSnack({ open: true, message: 'Review approved and ready to display.', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not approve review', severity: 'error' });
    }
  }

  function handleDiscardClick(id: string) {
    setDiscardId(id);
  }

  async function handleSaveReply(id: string, reply: string) {
    try {
      await setReviewReply(id, reply);
      setSnack({ open: true, message: 'Reply saved.', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not save reply', severity: 'error' });
    }
  }

  async function confirmSendToNeedsAction() {
    if (!needsActionConfirmId) return;
    try {
      await sendApprovedToNeedsAction(needsActionConfirmId);
      setTab(0);
      setSnack({ open: true, message: 'Review moved to Needs action.', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not update review', severity: 'error' });
    }
    setNeedsActionConfirmId(null);
  }

  async function confirmDiscardedToNeedsAction() {
    if (!discardedToQueueId) return;
    try {
      await sendDiscardedToNeedsAction(discardedToQueueId);
      setTab(0);
      setSnack({ open: true, message: 'Review moved to Needs action.', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not update review', severity: 'error' });
    }
    setDiscardedToQueueId(null);
  }

  async function confirmPermanentDeleteDiscarded() {
    if (!permanentDeleteDiscardedId) return;
    try {
      await permanentlyDeleteDiscarded(permanentDeleteDiscardedId);
      setSnack({ open: true, message: 'Discarded review permanently removed.', severity: 'info' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not delete review', severity: 'error' });
    }
    setPermanentDeleteDiscardedId(null);
  }

  async function confirmDeleteReply() {
    if (!deleteReplyId) return;
    try {
      await setReviewReply(deleteReplyId, '');
      setSnack({ open: true, message: 'Reply removed.', severity: 'info' });
    } catch (e) {
      setSnack({ open: true, message: e instanceof Error ? e.message : 'Could not remove reply', severity: 'error' });
    }
    setDeleteReplyId(null);
  }

  const sections: { status: ReviewState; label: string; data: Review[]; index: number }[] = [
    { status: 'needs_action', label: 'Needs action', data: sortedNeedsAction, index: 0 },
    { status: 'approved', label: 'Approved', data: sortedApproved, index: 1 },
    { status: 'discarded', label: 'Discarded', data: sortedDiscarded, index: 2 },
  ];

  useEffect(() => {
    setReviewListPage(1);
  }, [tab, reviewSort]);

  useEffect(() => {
    const data = tab === 0 ? sortedNeedsAction : tab === 1 ? sortedApproved : sortedDiscarded;
    const totalPages = Math.max(1, Math.ceil(data.length / REVIEWS_PAGE_SIZE));
    setReviewListPage((p) => Math.min(p, totalPages));
  }, [tab, sortedNeedsAction, sortedApproved, sortedDiscarded]);

  return (
    <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 0 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        {loading && <LinearProgress sx={{ borderRadius: 1 }} aria-label="Loading reviews" />}
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => void refreshReviews()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        <Fade in timeout={450}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.35),
              bgcolor: '#ffffff',
              backgroundImage: gradients.heroWelcome,
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ md: 'center' }}>
                <Stack spacing={1.25} sx={{ maxWidth: 720 }}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <RateReviewIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.14em', color: 'text.secondary' }}>
                      Client feedback
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Reviews
                  </Typography>
                  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ maxWidth: 640 }}>
                    <LockOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, fontWeight: 600 }}>
                      Admin only: name, rating, role, service used, and full review text are visible only in this workspace. Your public site should receive
                      only what you explicitly publish after approval.
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, mt: 0.5, fontWeight: 500 }}>
                    API: <strong>{getApiBaseForDisplay()}</strong>. Approve, discard, and manage replies via{' '}
                    <code style={{ fontSize: '0.9em' }}>/api/reviews</code>.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <AutoAwesomeIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    New feedback appears under Needs action
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Analytics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          <ReviewAnalyticsCard
            title="Pending"
            value={needsAction.length}
            subtitle="Need approve or discard"
            icon={<PendingActionsIcon />}
            color="#d97706"
            delay={0}
          />
          <ReviewAnalyticsCard
            title="Approved"
            value={approved.length}
            subtitle="Shown (or ready to sync) to site"
            icon={<CheckCircleOutlineIcon />}
            color="#059669"
            delay={80}
          />
          <ReviewAnalyticsCard
            title="Avg rating"
            value={approved.length ? avgApproved.toFixed(1) : '—'}
            subtitle={
              approved.length
                ? `Approved only · ${approved.length} review${approved.length !== 1 ? 's' : ''}`
                : 'No approved reviews yet (needs action excluded)'
            }
            icon={<RateReviewIcon />}
            color="#43A047"
            delay={160}
          />
          <ReviewAnalyticsCard
            title="4–5 stars"
            value={approved.length ? `${highRatedPct}%` : '—'}
            subtitle="Share of approved reviews"
            icon={<AutoAwesomeIcon />}
            color="#EF6C00"
            delay={240}
          />
        </Box>

        {/* Distribution */}
        <Grow in timeout={700} style={{ transitionDelay: '200ms' }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Rating breakdown
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Approved reviews only (needs action and discarded are excluded — same basis as average rating)
              </Typography>
              <Stack spacing={1.75}>
                {[...distribution].reverse().map(({ stars, count, pct }) => (
                  <Stack key={stars} direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" sx={{ width: 72, fontWeight: 700, color: 'text.secondary' }}>
                      {stars} star{stars !== 1 ? 's' : ''}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: stars >= 4 ? 'success.main' : stars <= 2 ? 'error.light' : 'warning.main',
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ width: 32, textAlign: 'right', fontWeight: 700 }}>
                      {count}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grow>

        {/* Tabs + lists */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: (t) => alpha(t.palette.grey[100], 0.5) }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: { xs: 1, sm: 2 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  minHeight: 56,
                },
                '& .Mui-selected': { color: 'primary.main' },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" alignItems="center" gap={1}>
                    <span>Needs action</span>
                    {needsAction.length > 0 && (
                      <Chip label={needsAction.length} size="small" color="warning" sx={{ height: 22, fontWeight: 800 }} />
                    )}
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" alignItems="center" gap={1}>
                    <span>Approved</span>
                    <Chip label={approved.length} size="small" color="success" variant="outlined" sx={{ height: 22, fontWeight: 800 }} />
                  </Stack>
                }
              />
              <Tab label={`Discarded (${discarded.length})`} />
            </Tabs>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: (t) => alpha(t.palette.grey[50], 0.85),
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <SortIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Sort reviews
                </Typography>
              </Stack>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
                <InputLabel id="review-sort-label">Order</InputLabel>
                <Select
                  labelId="review-sort-label"
                  id="review-sort"
                  label="Order"
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as ReviewListSort)}
                  sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                >
                  <MenuItem value="newest">Latest first (newest → oldest)</MenuItem>
                  <MenuItem value="ratingHigh">Rating: high → low</MenuItem>
                  <MenuItem value="ratingLow">Rating: low → high</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
              Applies to all tabs (Needs action, Approved, Discarded). Date order uses submission time.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
            {sections.map(({ status, data, index }) => {
              const totalPages = Math.max(1, Math.ceil(data.length / REVIEWS_PAGE_SIZE));
              const pageSafe = Math.min(reviewListPage, totalPages);
              const paginated = data.slice((pageSafe - 1) * REVIEWS_PAGE_SIZE, pageSafe * REVIEWS_PAGE_SIZE);
              const rangeStart = data.length === 0 ? 0 : (pageSafe - 1) * REVIEWS_PAGE_SIZE + 1;
              const rangeEnd = Math.min(pageSafe * REVIEWS_PAGE_SIZE, data.length);

              return (
                <TabPanel key={status} value={tab} index={index}>
                  {data.length === 0 ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                      <RateReviewIcon sx={{ fontSize: 56, color: 'action.disabled', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {status === 'needs_action' && 'All caught up'}
                        {status === 'approved' && 'No approved reviews yet'}
                        {status === 'discarded' && 'No discarded items'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {status === 'needs_action' && 'New submissions from your website will appear here.'}
                        {status === 'approved' && 'Approve reviews in Needs action to build your public wall of feedback.'}
                        {status === 'discarded' &&
                          'Send items back to Needs action to review again, or delete them permanently when you no longer need the record.'}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Stack spacing={2.5}>
                        {paginated.map((review, i) => (
                          <Grow key={review.id} in timeout={450} style={{ transitionDelay: `${Math.min(i, 8) * 70}ms` }}>
                            <Box>
                              <ReviewCard
                                review={review}
                                variant={status}
                                onApprove={handleApprove}
                                onDiscard={handleDiscardClick}
                                onSaveReply={handleSaveReply}
                                onSendToNeedsAction={status === 'approved' ? (id) => setNeedsActionConfirmId(id) : undefined}
                                onRequestDeleteReply={status === 'approved' ? (id) => setDeleteReplyId(id) : undefined}
                                onDiscardedSendToNeedsAction={status === 'discarded' ? (id) => setDiscardedToQueueId(id) : undefined}
                                onDiscardedPermanentDelete={status === 'discarded' ? (id) => setPermanentDeleteDiscardedId(id) : undefined}
                              />
                            </Box>
                          </Grow>
                        ))}
                      </Stack>
                      {data.length > REVIEWS_PAGE_SIZE && (
                        <Stack alignItems="center" spacing={1.5} sx={{ pt: 3 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Showing {rangeStart}–{rangeEnd} of {data.length}
                          </Typography>
                          <Pagination
                            count={totalPages}
                            page={pageSafe}
                            onChange={(_, p) => setReviewListPage(p)}
                            color="primary"
                            shape="rounded"
                            showFirstButton
                            showLastButton
                            siblingCount={1}
                            boundaryCount={1}
                          />
                        </Stack>
                      )}
                    </>
                  )}
                </TabPanel>
              );
            })}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={Boolean(discardId)} onClose={() => setDiscardId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Discard this review?
          <IconButton aria-label="close" onClick={() => setDiscardId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            It will move to the Discarded tab and will not be shown on your public site. You can keep it for internal records.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDiscardId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDiscard} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Discard review
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(needsActionConfirmId)} onClose={() => setNeedsActionConfirmId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Send back to Needs action?
          <IconButton aria-label="close" onClick={() => setNeedsActionConfirmId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The review will leave the Approved list and appear again under Needs action so you can re-review, edit your reply, approve, or discard it.
            Nothing is permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setNeedsActionConfirmId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={confirmSendToNeedsAction} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Send to Needs action
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(discardedToQueueId)} onClose={() => setDiscardedToQueueId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Send discarded review to Needs action?
          <IconButton aria-label="close" onClick={() => setDiscardedToQueueId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This review will leave Discarded and appear under Needs action so you can approve it or discard it again. It is not permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDiscardedToQueueId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={confirmDiscardedToNeedsAction} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Send to Needs action
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(permanentDeleteDiscardedId)} onClose={() => setPermanentDeleteDiscardedId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Permanently delete this review?
          <IconButton aria-label="close" onClick={() => setPermanentDeleteDiscardedId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This removes the discarded review from your admin data for good. You cannot undo this.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPermanentDeleteDiscardedId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmPermanentDeleteDiscarded} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteReplyId)} onClose={() => setDeleteReplyId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Delete saved reply?
          <IconButton aria-label="close" onClick={() => setDeleteReplyId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The reply text will be cleared. You can write a new reply anytime from the reply button.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteReplyId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDeleteReply} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Delete reply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
