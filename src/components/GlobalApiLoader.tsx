import { useEffect, useState } from 'react';
import { subscribeToApiRequestCount } from '../api/apiBase';

const SHOW_DELAY_MS = 180;
const MIN_VISIBLE_MS = 400;

export default function GlobalApiLoader() {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeToApiRequestCount(setPendingCount);
  }, []);

  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    if (pendingCount > 0) {
      showTimer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    } else if (visible) {
      hideTimer = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    }

    return () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [pendingCount, visible]);

  if (!visible) return null;

  return (
    <div className="global-api-loader-backdrop" role="status" aria-live="polite" aria-label="Loading data">
      <div className="global-api-loader-card">
        <div className="global-api-loader-orb" />
        <div className="global-api-loader-ring" />
        <p className="global-api-loader-title">Please wait...</p>
        <p className="global-api-loader-subtitle">Syncing latest updates from server</p>
      </div>
    </div>
  );
}
