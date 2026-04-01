import type { ReactNode } from 'react';
import { PostProvider } from '../context/PostContext';
import { ReviewProvider } from '../context/ReviewContext';
import { CareerProvider } from '../context/CareerContext';

/** Blog / review / candidate API loads only run after `ProtectedRoute` confirms a session. */
export function AdminDataProviders({ children }: { children: ReactNode }) {
  return (
    <PostProvider>
      <ReviewProvider>
        <CareerProvider>{children}</CareerProvider>
      </ReviewProvider>
    </PostProvider>
  );
}
