'use client'

import { useEffect, useRef } from 'react';
import { incrementView } from '@/app/actions/interactions';

export function ViewCounter({ blogId }: { blogId: string }) {
  const viewed = useRef(false);

  useEffect(() => {
    if (!viewed.current) {
      incrementView(blogId);
      viewed.current = true;
    }
  }, [blogId]);

  return null; // This component doesn't render anything visibly
}
