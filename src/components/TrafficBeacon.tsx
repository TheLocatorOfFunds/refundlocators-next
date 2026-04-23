'use client';

/**
 * TrafficBeacon — fires a lightweight pageview event to our Supabase
 * analytics-drain edge function on every route navigation.
 *
 * Runs entirely client-side. No cookies, no PII beyond path + referrer.
 * Silently drops if the network request fails (fire-and-forget).
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const DRAIN_URL = 'https://rcfaashkfpurkvtmsmeb.supabase.co/functions/v1/analytics-drain';

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Chromium/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

// Stable session ID for this browser tab (resets on close)
let sessionId: string;
function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      sessionStorage.getItem('_rl_sid') ??
      (() => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem('_rl_sid', id);
        return id;
      })();
  }
  return sessionId;
}

function sendBeacon(path: string, referrer: string) {
  const event = {
    eventType: 'pageview',
    timestamp: Date.now(),
    path,
    referrer,
    deviceType: getDeviceType(),
    clientName: getBrowser(),
    osName: getOS(),
    sessionId: getSessionId(),
    projectId: 'refundlocators-next',
  };

  // navigator.sendBeacon is ideal — doesn't block navigation
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify([event])], { type: 'application/json' });
    navigator.sendBeacon(DRAIN_URL, blob);
  } else {
    fetch(DRAIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([event]),
      keepalive: true,
    }).catch(() => {/* silently drop */});
  }
}

export default function TrafficBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
    // Skip if same path (strict-mode double-invoke guard)
    if (prevPathRef.current === fullPath) return;
    prevPathRef.current = fullPath;

    const referrer = prevPathRef.current === null ? document.referrer : '';
    sendBeacon(fullPath, referrer);
  }, [pathname, searchParams]);

  return null;
}
