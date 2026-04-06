import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import { fetchConsultationsList, deleteConsultation } from '../api/consultationsApi';
import { gradients } from '../theme/branding';
import { mapApiConsultationToConsultation, type Consultation } from '../types/Consultation';

export default function Consultations() {
  const [rows, setRows] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [snack, setSnack] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchConsultationsList();
      setRows(docs.map(mapApiConsultationToConsultation));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load consultation requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const deletingRow = deleteId ? rows.find((r) => r.id === deleteId) ?? null : null;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteConsultation(deleteId);
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      setSnack({ message: 'Consultation request deleted.', severity: 'success' });
    } catch (e) {
      setSnack({ message: e instanceof Error ? e.message : 'Failed to delete request', severity: 'error' });
    } finally {
      setDeleteId(null);
    }
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
                  <SupportAgentIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Free consultation requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View users who asked for a free consultation and remove records once handled.
                  </Typography>
                </Box>
              </Stack>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void load()}>
                Refresh
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="Search name, email, phone, message"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
              <Chip label={`${filtered.length} request${filtered.length !== 1 ? 's' : ''}`} />
            </Stack>

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small" sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading && filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                          No consultation requests found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Button
                            variant="text"
                            onClick={() => setActiveConsultation(r)}
                            sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 700 }}
                          >
                            {r.name}
                          </Button>
                        </TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.phone || '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 420 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              cursor: 'pointer',
                            }}
                            title={r.message}
                            onClick={() => setActiveConsultation(r)}
                          >
                            {r.message}
                          </Typography>
                        </TableCell>
                        <TableCell>{format(new Date(r.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            aria-label={`Delete consultation request from ${r.name}`}
                            onClick={() => setDeleteId(r.id)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete request?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deletingRow
              ? `This will permanently delete the consultation request from ${deletingRow.name} (${deletingRow.email}).`
              : 'This will permanently delete this consultation request.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(activeConsultation)} onClose={() => setActiveConsultation(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Consultation message</DialogTitle>
        <DialogContent dividers>
          {activeConsultation ? (
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                <strong>Name:</strong> {activeConsultation.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {activeConsultation.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Phone:</strong> {activeConsultation.phone || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Submitted:</strong> {format(new Date(activeConsultation.createdAt), 'dd MMM yyyy, HH:mm')}
              </Typography>
              <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{activeConsultation.message}</Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveConsultation(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </Container>
  );
}
