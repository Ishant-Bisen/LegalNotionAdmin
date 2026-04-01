import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  alpha,
  Alert,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import { LN, gradients, LOGO_PUBLIC_PATH } from '../theme/branding';

type LocationState = {
  from?: { pathname: string };
};

export default function Login() {
  const { login, user, loginError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      setSubmitting(false);
      return;
    }
    const ok = await login(email, password);
    if (!ok) {
      setError(loginError ?? 'Login failed.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    navigate(from, { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 3,
        pt: 'max(24px, env(safe-area-inset-top))',
        pb: 'max(24px, env(safe-area-inset-bottom))',
        background: gradients.pageBackdrop,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: alpha(LN.green.main, 0.35),
          boxShadow: `0 12px 40px ${alpha('#000', 0.12)}, 0 2px 0 ${alpha(LN.green.main, 0.12)}`,
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, pt: { xs: 3, sm: 3.5 } }}>
          <Stack spacing={2.25} component="form" onSubmit={handleSubmit}>
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 104,
                  height: 104,
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
                    alt=""
                    onError={() => setLogoFailed(true)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                      boxSizing: 'border-box',
                      transform: 'scale(2.15)',
                      transformOrigin: 'center center',
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>LN</Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 0.5 }}>
                Legal Notion Admin
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1.45 }}>
                Sign in to manage posts and reviews
              </Typography>
            </Stack>

            {error ? (
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            ) : null}

            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.35, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>

            {import.meta.env.DEV ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                Use the admin email and password configured for this deployment.
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                Use the admin email and password configured for this deployment.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
