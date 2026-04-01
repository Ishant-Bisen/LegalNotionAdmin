import { useMemo, useState, useCallback } from 'react';
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useCareers } from '../context/CareerContext';
import type { Candidate, CandidateStatus } from '../types/Candidate';
import { getCandidateResumeUrl } from '../api/candidatesApi';
import { gradients } from '../theme/branding';

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | CandidateStatus;

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`careers-tabpanel-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function sortByDate(list: Candidate[], order: SortOrder): Candidate[] {
  const copy = [...list];
  const t = (d: string) => new Date(d).getTime();
  copy.sort((a, b) => (order === 'newest' ? t(b.createdAt) - t(a.createdAt) : t(a.createdAt) - t(b.createdAt)));
  return copy;
}

function statusChip(status: CandidateStatus) {
  switch (status) {
    case 'accepted':
      return <Chip size="small" icon={<CheckCircleOutlineIcon />} label="Accepted" color="success" variant="outlined" />;
    case 'rejected':
      return <Chip size="small" icon={<CancelOutlinedIcon />} label="Rejected" color="error" variant="outlined" />;
    case 'waiting':
      return <Chip size="small" icon={<HourglassEmptyIcon />} label="Waiting" color="warning" variant="outlined" />;
  }
}

function buildSelectionMailto(c: Candidate): string {
  const subject = encodeURIComponent('Regarding your application – Legal Notion');
  const body = encodeURIComponent(
    `Dear ${c.name},\n\nWe are pleased to inform you that your application has been accepted.\n\nNext steps will follow shortly.\n\nBest regards,\nLegal Notion Team`,
  );
  return `mailto:${c.email}?subject=${subject}&body=${body}`;
}

const emptyForm = {
  name: '',
  email: '',
  college: '',
  passoutYear: new Date().getFullYear(),
  location: '',
};

export default function Careers() {
  const { candidates, submitCandidate, setCandidateStatus, setSelectionMailSent } = useCareers();
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [snack, setSnack] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const filtered = useMemo(() => {
    let list = candidates;
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    return sortByDate(list, sortOrder);
  }, [candidates, statusFilter, sortOrder]);

  const acceptedOnly = useMemo(
    () => sortByDate(candidates.filter((c) => c.status === 'accepted'), sortOrder),
    [candidates, sortOrder],
  );

  const acceptedCount = useMemo(() => candidates.filter((c) => c.status === 'accepted').length, [candidates]);

  const handlePdf = useCallback((file: File | null) => {
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setSnack({ message: 'Please upload a PDF file.', severity: 'error' });
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  }, []);

  const submitAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.college.trim() || !form.location.trim()) {
      setSnack({ message: 'Name, email, college, and location are required.', severity: 'error' });
      return;
    }
    const passout = Number(form.passoutYear);
    if (!Number.isFinite(passout)) {
      setSnack({ message: 'Passout year is required and must be a number.', severity: 'error' });
      return;
    }
    if (!resumeFile) {
      setSnack({ message: 'Resume PDF is required.', severity: 'error' });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('college', form.college.trim());
      fd.append('location', form.location.trim());
      fd.append('passoutYear', String(passout));
      fd.append('resume', resumeFile);

      await submitCandidate(fd);
      setForm(emptyForm);
      setResumeFile(null);
      setAddOpen(false);
      setSnack({ message: 'Applicant submitted.', severity: 'success' });
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Could not submit application', severity: 'error' });
    }
  };

  const handleSetStatus = async (id: string, status: CandidateStatus) => {
    try {
      await setCandidateStatus(id, status);
      const label = status === 'accepted' ? 'Accepted' : status === 'waiting' ? 'Waiting' : 'Rejected';
      setSnack({ message: `Candidate marked as ${label}.`, severity: 'success' });
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Could not update candidate status', severity: 'error' });
    }
  };

  const exportExcel = () => {
    const accepted = candidates.filter((c) => c.status === 'accepted');
    if (accepted.length === 0) {
      setSnack({ message: 'No accepted candidates to export.', severity: 'error' });
      return;
    }
    const rows = accepted.map((c) => ({
      Name: c.name,
      Email: c.email,
      College: c.college,
      'Passout year': c.passoutYear,
      Location: c.location,
      'Applied at': c.createdAt,
      'Selection email sent': c.selectionMailSent ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected');
    XLSX.writeFile(wb, `legal-notion-selected-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    setSnack({ message: `Exported ${accepted.length} candidate(s).`, severity: 'success' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            background: gradients.heroWelcome,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <WorkOutlineIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Careers & applicants
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review applications, update status, track selection emails, and export accepted candidates.
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                  Add applicant
                </Button>
                <Tooltip title="Exports all accepted candidates to Excel">
                  <span>
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportExcel} disabled={acceptedCount === 0}>
                      Export selected (Excel)
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Careers sections">
              <Tab label="Pipeline" id="careers-tab-0" />
              <Tab label="Selection emails" id="careers-tab-1" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TabPanel value={tab} index={0}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="waiting">Waiting</MenuItem>
                      <MenuItem value="accepted">Accepted</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Sort by date</InputLabel>
                    <Select label="Sort by date" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                      <MenuItem value="newest">Newest first</MenuItem>
                      <MenuItem value="oldest">Oldest first</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
                    {filtered.length} applicant{filtered.length !== 1 ? 's' : ''}
                  </Typography>
                </Stack>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Table size="small" sx={{ minWidth: 960 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>College</TableCell>
                        <TableCell>Passout</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Applied</TableCell>
                        <TableCell>Resume</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9}>
                            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                              No applicants match this filter.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.college || '—'}</TableCell>
                            <TableCell>{c.passoutYear}</TableCell>
                            <TableCell>{c.location || '—'}</TableCell>
                            <TableCell>{format(new Date(c.createdAt), 'dd MMM yyyy')}</TableCell>
                            <TableCell>
                              {c.resumeOriginalName || c.resumeFileName ? (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Chip
                                    size="small"
                                    icon={<PictureAsPdfIcon />}
                                    label={c.resumeOriginalName || c.resumeFileName || 'Resume'}
                                    variant="outlined"
                                  />
                                  <Tooltip title="Open PDF">
                                    <IconButton
                                      size="small"
                                      href={getCandidateResumeUrl(c.id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="Open resume"
                                    >
                                      <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      size="small"
                                      aria-label="Download resume"
                                      href={getCandidateResumeUrl(c.id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No file
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>{statusChip(c.status)}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                                <Button size="small" color="success" onClick={() => void handleSetStatus(c.id, 'accepted')}>
                                  Accept
                                </Button>
                                <Button size="small" color="warning" onClick={() => void handleSetStatus(c.id, 'waiting')}>
                                  Waiting
                                </Button>
                                <Button size="small" color="error" onClick={() => void handleSetStatus(c.id, 'rejected')}>
                                  Reject
                                </Button>
                                {c.status === 'accepted' && (
                                  <>
                                    <Tooltip title="Opens your email client">
                                      <Button size="small" startIcon={<MailOutlineIcon />} href={buildSelectionMailto(c)} component="a">
                                        Email
                                      </Button>
                                    </Tooltip>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For accepted candidates only. Mark when the selection email has been sent (opens in your mail app — this does not auto-send).
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Sort by date</InputLabel>
                  <Select label="Sort by date" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                    <MenuItem value="newest">Newest first</MenuItem>
                    <MenuItem value="oldest">Oldest first</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Applied</TableCell>
                      <TableCell>Selection email sent</TableCell>
                      <TableCell align="right">Compose</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {acceptedOnly.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                            No accepted candidates yet. Accept someone from the Pipeline tab.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      acceptedOnly.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell>{format(new Date(c.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={c.selectionMailSent}
                                  onChange={(_, checked) => setSelectionMailSent(c.id, checked)}
                                  color="primary"
                                />
                              }
                              label={c.selectionMailSent ? 'Sent' : 'Not sent'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" startIcon={<MailOutlineIcon />} href={buildSelectionMailto(c)} component="a">
                              Open mail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add applicant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" required fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField label="College" fullWidth value={form.college} onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))} />
            <TextField
              label="Passout year"
              type="number"
              fullWidth
              value={form.passoutYear}
              onChange={(e) => setForm((f) => ({ ...f, passoutYear: Number(e.target.value) }))}
            />
            <TextField
              label="Location"
              fullWidth
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />}>
              Attach resume (PDF)
              <input
                type="file"
                hidden
                accept="application/pdf,.pdf"
                onChange={(e) => handlePdf(e.target.files?.[0] ?? null)}
              />
            </Button>
            {resumeFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {resumeFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitAdd}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </Container>
  );
}
