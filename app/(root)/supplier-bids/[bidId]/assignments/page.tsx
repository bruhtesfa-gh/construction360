'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AssignmentsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the parent supplier-bids page with the assignments tab active
    const bidId = params?.bidId as string;
    if (bidId) {
      router.replace(`/supplier-bids/${bidId}#assignments`);
    } else {
      router.replace('/supplier-bids');
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}