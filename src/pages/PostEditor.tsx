import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Box,
  TextField,
  Button,
  Chip,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import DraftsIcon from '@mui/icons-material/Drafts';
import PublishIcon from '@mui/icons-material/Publish';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ImageIcon from '@mui/icons-material/Image';
import { LN, gradients } from '../theme/branding';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TitleIcon from '@mui/icons-material/Title';
import ShortTextIcon from '@mui/icons-material/ShortText';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { usePosts } from '../context/PostContext';
import type { Post, PostStatus } from '../types/Post';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
};

function WritingIllustration() {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-56 h-auto"
    >
      {/* desk surface */}
      <rect x="20" y="120" width="200" height="8" rx="4" fill="#e0e7ff" className="animate-fade-up delay-200" />

      {/* laptop body */}
      <g className="animate-fade-up delay-300">
        <rect x="55" y="60" width="130" height="60" rx="8" fill="#43A047" />
        <rect x="60" y="65" width="120" height="50" rx="4" fill="#1B5E20" />
        {/* screen content lines */}
        <rect x="70" y="76" width="60" height="3" rx="1.5" fill="#a5b4fc" opacity="0.8">
          <animate attributeName="width" values="20;60;20" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="70" y="84" width="45" height="3" rx="1.5" fill="#81C784" opacity="0.6">
          <animate attributeName="width" values="45;30;45" dur="4s" repeatCount="indefinite" />
        </rect>
        <rect x="70" y="92" width="80" height="3" rx="1.5" fill="#a5b4fc" opacity="0.5">
          <animate attributeName="width" values="50;80;50" dur="3.5s" repeatCount="indefinite" />
        </rect>
        <rect x="70" y="100" width="35" height="3" rx="1.5" fill="#81C784" opacity="0.4">
          <animate attributeName="width" values="35;55;35" dur="2.8s" repeatCount="indefinite" />
        </rect>
        {/* cursor blink */}
        <rect x="136" y="76" width="2" height="12" rx="1" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* floating doc page */}
      <g className="animate-float">
        <rect x="170" y="30" width="40" height="52" rx="4" fill="#fff" stroke="#c7d2fe" strokeWidth="1.5" />
        <rect x="177" y="40" width="26" height="2" rx="1" fill="#c7d2fe" />
        <rect x="177" y="46" width="20" height="2" rx="1" fill="#e0e7ff" />
        <rect x="177" y="52" width="24" height="2" rx="1" fill="#e0e7ff" />
        <rect x="177" y="58" width="16" height="2" rx="1" fill="#e0e7ff" />
        <rect x="177" y="64" width="22" height="2" rx="1" fill="#e0e7ff" />
      </g>

      {/* floating pen */}
      <g className="animate-float-delayed">
        <line x1="30" y1="40" x2="55" y2="75" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <polygon points="55,75 52,82 58,80" fill="#f59e0b" />
        <circle cx="30" cy="40" r="3" fill="#fbbf24" />
      </g>

      {/* sparkles */}
      <g className="animate-float-slow">
        <circle cx="150" cy="25" r="2.5" fill="#fbbf24" opacity="0.8">
          <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="45" cy="55" r="2" fill="#a78bfa" opacity="0.7">
          <animate attributeName="r" values="1.5;3;1.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="95" r="1.5" fill="#34d399" opacity="0.6">
          <animate attributeName="r" values="1;2.5;1" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* small stars */}
      <path d="M160 12l1.5 3 3 .5-2 2.2.5 3.3-3-1.5-3 1.5.5-3.3-2-2.2 3-.5z" fill="#fbbf24" opacity="0.6" className="animate-pulse-ring" />
      <path d="M25 95l1 2 2 .3-1.5 1.5.3 2.2-2-1-2 1 .3-2.2L22 97.3l2-.3z" fill="#FFCA28" opacity="0.6" className="animate-pulse-ring" />
    </svg>
  );
}

const MIN_SUMMARY_LEN = 20;
const MIN_CONTENT_LEN = 20;

/** Dark emerald for “complete” UI — easier to see than lighter mint greens */
const COMPLETE_GREEN = '#065f46';
const INCOMPLETE_MUTED = '#64748b';

function plainTextFromHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function CompletionBar({
  title,
  summary,
  content,
  coverImage,
  labels,
}: {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  labels: string[];
}) {
  const steps = [
    { key: 'title', label: 'Title', done: title.trim().length > 0 },
    {
      key: 'summary',
      label: 'Summary',
      done: summary.trim().length >= MIN_SUMMARY_LEN,
    },
    {
      key: 'content',
      label: 'Content',
      done: plainTextFromHtml(content).length > MIN_CONTENT_LEN,
    },
    {
      key: 'cover',
      label: 'Cover image',
      done: coverImage.trim().length > 0,
    },
    {
      key: 'labels',
      label: 'Labels',
      done: labels.length > 0 && labels.every((l) => l.trim().length > 0),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progress = (doneCount / steps.length) * 100;

  return (
    <Box sx={{ px: 4, py: 2.5, bgcolor: 'rgba(248,250,252,0.8)', borderBottom: '1px solid #f1f5f9' }} className="animate-fade-up delay-400">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Completion
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: progress === 100 ? COMPLETE_GREEN : LN.green.dark,
            pr: 0.5,
            flexShrink: 0,
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#e2e8f0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: progress === 100
              ? `linear-gradient(90deg, ${COMPLETE_GREEN}, #047857)`
              : gradients.mixBar,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1.25, sm: 2 },
          rowGap: 1,
          mt: 1.75,
        }}
      >
        {steps.map((s) => (
          <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: s.done ? COMPLETE_GREEN : '#cbd5e1',
                transition: 'background-color 0.3s',
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                color: s.done ? COMPLETE_GREEN : INCOMPLETE_MUTED,
                fontWeight: s.done ? 700 : 500,
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ fontSize: 10, color: '#94a3b8', mt: 1.25, lineHeight: 1.4 }}>
        100% requires title, summary ({MIN_SUMMARY_LEN}+ chars), body content, a cover image, and at least one label.
      </Typography>
    </Box>
  );
}

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, addPost, updatePost, fetchPostById, availableTags, addTag, removeTag } = usePosts();

  const postInList = id ? posts.find((p) => p.id === id) : undefined;
  const hasPostInList = Boolean(id && posts.some((p) => p.id === id));
  const [singleFetched, setSingleFetched] = useState<Post | null>(null);
  const [loadEditor, setLoadEditor] = useState(false);
  const [loadEditorError, setLoadEditorError] = useState<string | null>(null);

  const existingPost = postInList ?? singleFetched ?? undefined;
  const isEditing = Boolean(id && existingPost);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [timeToRead, setTimeToRead] = useState<number>(1);
  const [newTagInput, setNewTagInput] = useState('');
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setSingleFetched(null);
      setLoadEditorError(null);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (hasPostInList) {
      setSingleFetched(null);
      setLoadEditorError(null);
      setLoadEditor(false);
      return;
    }
    let cancelled = false;
    setLoadEditor(true);
    setLoadEditorError(null);
    (async () => {
      const p = await fetchPostById(id);
      if (cancelled) return;
      if (p) {
        setSingleFetched(p);
      } else {
        setSingleFetched(null);
        setLoadEditorError('Could not load this blog. It may have been deleted or the link is invalid.');
      }
      setLoadEditor(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, hasPostInList, fetchPostById]);

  useEffect(() => {
    if (!id) {
      setTitle('');
      setSummary('');
      setContent('');
      setLabels([]);
      setCoverImage('');
      setTimeToRead(1);
    }
  }, [id]);

  useEffect(() => {
    if (!existingPost) return;
    setTitle(existingPost.title);
    setSummary(existingPost.summary ?? '');
    setContent(existingPost.content);
    setLabels(existingPost.labels);
    setCoverImage(existingPost.coverImage);
    setTimeToRead(existingPost.timeToRead);
  }, [existingPost?.id, existingPost?.updatedAt]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  function handleToggleLabel(label: string) {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(status: PostStatus) {
    if (!canSave || saving) return;
    const postData = { title, summary, content, labels, coverImage, timeToRead, status };

    setSaving(true);
    try {
      if (isEditing && id) {
        await updatePost(id, postData);
        setToast({
          open: true,
          message: `Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`,
          severity: 'success',
        });
        setTimeout(() => navigate('/posts'), 1200);
      } else {
        await addPost(postData);
        setToast({
          open: true,
          message: `Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`,
          severity: 'success',
        });
        setTimeout(() => navigate('/posts'), 1200);
      }
    } catch (e) {
      setToast({
        open: true,
        message: e instanceof Error ? e.message : 'Could not save post',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  function handleAddNewTag() {
    const trimmed = newTagInput.trim();
    if (trimmed) {
      addTag(trimmed);
      setNewTagInput('');
    }
  }

  const unselectedTags = availableTags.filter((t) => !labels.includes(t));

  const titleComplete = title.trim().length > 0;
  const summaryComplete = summary.trim().length >= MIN_SUMMARY_LEN;
  const contentComplete = plainTextFromHtml(content).length > MIN_CONTENT_LEN;

  const sectionLabelSx = (done: boolean) => ({
    fontSize: 11,
    fontWeight: done ? 700 : 600,
    color: done ? COMPLETE_GREEN : INCOMPLETE_MUTED,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    transition: 'color 0.3s',
  });

  const sectionIconSx = (done: boolean, fontSize: number) => ({
    fontSize,
    color: done ? COMPLETE_GREEN : INCOMPLETE_MUTED,
    transition: 'color 0.3s',
  });

  if (id && loadEditorError) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadEditorError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/posts')} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Back to all posts
        </Button>
      </Box>
    );
  }

  if (id && loadEditor) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
        <LinearProgress sx={{ borderRadius: 1 }} />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading blog…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
      {/* ───── Animated Hero Header ───── */}
      <Paper
        elevation={0}
        className="animate-fade-up"
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          mb: 5,
          border: '1px solid',
          borderColor: alpha(LN.green.main, 0.25),
          bgcolor: '#ffffff',
          backgroundImage:
            'linear-gradient(135deg, #ffffff 0%, #f0faf2 45%, #fff8f0 100%)',
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } }}>
          <Box className="flex-1 animate-fade-up delay-100">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <IconButton
                onClick={() => navigate(-1)}
                size="small"
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: alpha(LN.green.main, 0.2),
                  '&:hover': { bgcolor: '#f8faf8' },
                }}
              >
                <ArrowBackIcon fontSize="small" sx={{ color: LN.green.dark }} />
              </IconButton>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 14, color: '#f59e0b !important' }} />}
                label={isEditing ? 'Editing Mode' : 'New Article'}
                size="small"
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: alpha(LN.orange.main, 0.35),
                  color: LN.green.dark,
                  fontWeight: 600,
                  fontSize: 11,
                  borderRadius: '8px',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: gradients.mixDiagonal,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                mb: 1,
              }}
            >
              {isEditing ? 'Edit Your Article' : 'Create Something Great'}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, maxWidth: 420 }}>
              {isEditing
                ? 'Refine your content, update tags, and republish when ready.'
                : 'Craft your next article with the rich editor. Add labels, set a cover image, and publish when ready.'}
            </Typography>
          </Box>
          <Box className="hidden md:flex items-center justify-center animate-fade-up delay-300">
            <WritingIllustration />
          </Box>
        </Box>
      </Paper>

      {/* ───── Two-column layout ───── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 4, lg: 6 } }}>
        {/* LEFT — Main content area */}
        <Box className="flex-1 min-w-0 animate-fade-up delay-200">
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              '&:focus-within': {
                borderColor: '#c7d2fe',
                boxShadow: '0 0 0 3px rgba(99,102,241,0.08)',
              },
            }}
          >
            {/* Completion bar */}
            <CompletionBar
              title={title}
              summary={summary}
              content={content}
              coverImage={coverImage}
              labels={labels}
            />

            {/* Title area */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TitleIcon sx={sectionIconSx(titleComplete, 16)} />
                <Typography sx={sectionLabelSx(titleComplete)}>Title</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Enter your post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    py: 1,
                    transition: 'color 0.3s',
                    '& input::placeholder': { color: '#cbd5e1', opacity: 1 },
                  },
                }}
              />
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ShortTextIcon sx={sectionIconSx(summaryComplete, 16)} />
                  <Typography sx={sectionLabelSx(summaryComplete)}>Summary</Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  placeholder="A short summary for listings, cards, and previews (plain text)…"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value.slice(0, 400))}
                  inputProps={{ maxLength: 400 }}
                  helperText={`${summary.length}/400 — Shown on cards and read view. Use at least ${MIN_SUMMARY_LEN} characters to reach 100% completion.`}
                  FormHelperTextProps={{
                    sx: {
                      mx: 0,
                      mt: 1,
                      fontSize: 12,
                      color: summaryComplete ? COMPLETE_GREEN : INCOMPLETE_MUTED,
                      fontWeight: summaryComplete ? 700 : 500,
                      transition: 'color 0.3s',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#fafafa',
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: '#334155',
                    },
                  }}
                />
              </Box>

              <Divider sx={{ mt: 3, borderColor: '#f1f5f9' }} />
            </Box>

            {/* Editor area */}
            <Box sx={{ px: { xs: 3, md: 4 }, pb: { xs: 3, md: 4 } }} className="animate-fade-up delay-400">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeIcon sx={sectionIconSx(contentComplete, 14)} />
                <Typography sx={sectionLabelSx(contentComplete)}>Content</Typography>
              </Box>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={QUILL_MODULES}
                placeholder="Start writing your article..."
              />
            </Box>
          </Paper>
        </Box>

        {/* RIGHT — Settings sidebar: flex gap keeps clear separation between stacked cards */}
        <Box
          sx={{
            width: { xs: '100%', lg: 384 },
            maxWidth: '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 3.5, lg: 5 },
            pl: { lg: 0.5 },
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Actions card — no opacity entrance animation: opacity:0 during fade can stack under the editor and steal no clicks / mis-hit targets */}
          <Paper
            elevation={0}
            className="sidebar-card"
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3.5,
                py: 2.25,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: gradients.mixDiagonal,
              }}
            >
              <SettingsIcon sx={{ fontSize: 18, color: '#fff' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                Publish Settings
              </Typography>
            </Box>
            <Box sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Tooltip title={!canSave ? 'Add a title first' : saving ? 'Saving…' : ''} placement="top" disableHoverListener={canSave && !saving}>
                <span style={{ width: '100%' }}>
                  <Button
                    fullWidth
                    type="button"
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={() => void handleSave('published')}
                    disabled={!canSave || saving}
                    sx={{
                      bgcolor: LN.green.main,
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      py: 1.2,
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                      transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                      '&:hover': { bgcolor: LN.green.dark, transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(67, 160, 71, 0.45)' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
                    }}
                  >
                    {saving ? 'Saving…' : 'Publish Post'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={!canSave ? 'Add a title first' : saving ? 'Saving…' : ''} placement="top" disableHoverListener={canSave && !saving}>
                <span style={{ width: '100%' }}>
                  <Button
                    fullWidth
                    type="button"
                    variant="outlined"
                    startIcon={<DraftsIcon />}
                    onClick={() => void handleSave('draft')}
                    disabled={!canSave || saving}
                    sx={{
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      py: 1.2,
                      transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                      '&:hover': { borderColor: '#c7d2fe', bgcolor: '#f8fafc', transform: 'translateY(-1px)' },
                      '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' },
                    }}
                  >
                    {saving ? 'Saving…' : 'Save as Draft'}
                  </Button>
                </span>
              </Tooltip>
              <Button
                fullWidth
                type="button"
                variant="text"
                disabled={saving}
                onClick={() => navigate('/posts')}
                sx={{
                  color: '#94a3b8',
                  textTransform: 'none',
                  borderRadius: '10px',
                  fontWeight: 500,
                  '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' },
                }}
              >
                Discard
              </Button>
            </Box>
          </Paper>

          {/* Cover image card */}
          <Paper
            elevation={0}
            className="sidebar-card"
            sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3.5, py: 2.25, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <ImageIcon sx={{ fontSize: 18, color: LN.green.main }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
                Cover Image
              </Typography>
            </Box>
            <Box sx={{ p: 3.5 }}>
              {coverImage ? (
                <Box className="relative group rounded-xl overflow-hidden animate-scale-in">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-44 object-cover rounded-xl"
                    style={{ transition: 'transform 0.4s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <Box
                    className="absolute inset-0 flex items-center justify-center gap-2"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Button
                      component="label"
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: '#fff',
                        color: '#334155',
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: 12,
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      Replace
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setCoverImage('')}
                      sx={{
                        bgcolor: '#ef4444',
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: 12,
                        '&:hover': { bgcolor: '#dc2626' },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 140,
                    border: '2px dashed #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                    '&:hover': {
                      borderColor: '#a5b4fc',
                      bgcolor: 'rgba(238,242,255,0.5)',
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <Box className="animate-float" sx={{ mb: 1.5 }}>
                    <AddPhotoAlternateIcon sx={{ fontSize: 36, color: '#a5b4fc' }} />
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>
                    Click to upload
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#cbd5e1', mt: 0.5 }}>
                    PNG, JPG up to 5MB
                  </Typography>
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Box>
              )}
            </Box>
          </Paper>

          {/* Labels / Tags card */}
          <Paper
            elevation={0}
            className="sidebar-card"
            sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3.5, py: 2.25, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalOfferIcon sx={{ fontSize: 18, color: LN.green.main }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  Labels & Tags
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setManageTagsOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  color: LN.green.main,
                  fontWeight: 600,
                  minWidth: 'auto',
                  px: 1.5,
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#eef2ff' },
                }}
              >
                Manage
              </Button>
            </Box>
            <Box sx={{ p: 3.5 }}>
              {labels.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                    Selected ({labels.length})
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {labels.map((label, i) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        onDelete={() => handleToggleLabel(label)}
                        deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
                        className="chip-enter"
                        sx={{
                          bgcolor: LN.green.main,
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: 12,
                          borderRadius: '8px',
                          height: 28,
                          animationDelay: `${i * 50}ms`,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': { transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' },
                          '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                Pick from list
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={availableTags}
                value={labels}
                onChange={(_, newVal) => setLabels(newVal)}
                disableCloseOnSelect
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search tags..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontSize: 13,
                        bgcolor: '#f8fafc',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                        },
                      },
                    }}
                  />
                )}
                sx={{ mb: 3 }}
              />

              <Box className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {unselectedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onClick={() => handleToggleLabel(tag)}
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 500,
                      fontSize: 12,
                      borderRadius: '8px',
                      height: 28,
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                      '&:hover': {
                        bgcolor: '#eef2ff',
                        borderColor: '#c7d2fe',
                        color: '#4338ca',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 6px rgba(99,102,241,0.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Reading time card */}
          <Paper
            elevation={0}
                className="sidebar-card"
            sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3.5, py: 2.25, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: LN.green.main }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
                Reading Time
              </Typography>
            </Box>
            <Box sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="number"
                  size="small"
                  value={timeToRead}
                  onChange={(e) => setTimeToRead(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1 }}
                  sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: 14,
                      fontWeight: 600,
                      bgcolor: '#f8fafc',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
                    },
                  }}
                />
                <Typography sx={{ fontSize: 14, color: '#64748b' }}>minutes</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: 2 }}>
                Estimated time it takes to read this article.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ───── Manage Tags Dialog ───── */}
      <Dialog
        open={manageTagsOpen}
        onClose={() => setManageTagsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: gradients.mixDiagonal,
            px: 4,
            py: 3,
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#fff', p: 0, fontSize: 18 }}>
            Manage Tags
          </DialogTitle>
          <Typography sx={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, mt: 0.5 }}>
            Create your master tag library for quick access.
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3, px: 4 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter new tag name..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewTag();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 14 },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewTag}
              disabled={!newTagInput.trim()}
              sx={{
                bgcolor: LN.green.main,
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                px: 3,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: LN.green.dark },
              }}
            >
              Add
            </Button>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 280, overflowY: 'auto', pr: 1 }}>
            {availableTags.map((tag, i) => (
              <Box
                key={tag}
                className="group animate-fade-up"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  borderRadius: '10px',
                  animationDelay: `${i * 30}ms`,
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: LN.green.main,
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
                    }}
                  />
                  <Typography sx={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{tag}</Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeTag(tag)}
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s, color 0.2s',
                    color: '#94a3b8',
                    '.group:hover &': { opacity: 1 },
                    '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}
            {availableTags.length === 0 && (
              <Typography sx={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', py: 4 }}>
                No tags yet. Add your first tag above.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3, pt: 1 }}>
          <Button
            onClick={() => setManageTagsOpen(false)}
            variant="contained"
            sx={{
              bgcolor: LN.green.main,
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              px: 4,
              '&:hover': { bgcolor: LN.green.dark },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            fontWeight: 600,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
