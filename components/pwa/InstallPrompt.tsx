'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Share,
  PlusSquare,
  RefreshCw,
  WifiOff,
  Wifi,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // App Update State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Online / Offline State
  const [isOffline, setIsOffline] = useState(false);
  const [showNetworkToast, setShowNetworkToast] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // 3. Register Service Worker with update detection
    if (
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // If there's already a waiting worker
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }

          // Detect new updates found
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.log('AntiqueRide SW registration notice:', err);
        });

      // Reload when controller changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 4. Listen for beforeinstallprompt (Android / Desktop Chrome)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check session storage if user previously dismissed
      const wasDismissed = sessionStorage.getItem('antiqueride_install_dismissed');
      if (!wasDismissed) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Online / Offline network listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowNetworkToast(true);
      setTimeout(() => setShowNetworkToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowNetworkToast(true);
    };

    if (!navigator.onLine) {
      setIsOffline(true);
      setShowNetworkToast(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleApplyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateAvailable(false);
  };

  const handleDismissInstall = () => {
    setDismissed(true);
    sessionStorage.setItem('antiqueride_install_dismissed', 'true');
  };

  return (
    <>
      {/* 1. Offline / Online Toast Pill */}
      {showNetworkToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3">
          <div
            className={`px-4 py-2 rounded-2xl shadow-lg border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
              isOffline
                ? 'bg-amber-500/95 text-white border-amber-600'
                : 'bg-emerald-600/95 text-white border-emerald-700'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline Mode: Showing cached terminal directory and emergency hotlines</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>Back Online: Live GPS dispatch reconnected</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. PWA Update Ready Banner */}
      {updateAvailable && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-blue-900 text-white p-4 rounded-3xl shadow-2xl border border-blue-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-white">Application Update Ready</h5>
              <p className="text-[11px] text-blue-200">New features and fare updates available</p>
            </div>
          </div>
          <button
            onClick={handleApplyUpdate}
            className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Update
          </button>
        </div>
      )}

      {/* 3. Android & Desktop Chrome Standard Install Prompt */}
      {isInstallable && !dismissed && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-white text-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-md">
              <span>A</span>
              <span className="text-blue-200">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="font-extrabold text-xs text-slate-900">Install AntiqueRide</h5>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Install on your home screen for quick tricycle booking and offline GIS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismissInstall}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. iOS Safari Add to Home Screen Instructions */}
      {isIos && !isStandalone && !dismissed && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-white text-slate-900 p-4 rounded-3xl shadow-2xl border border-blue-200 space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <h5 className="font-extrabold text-xs text-slate-900">Install on iPhone / iPad</h5>
            </div>
            <button
              onClick={handleDismissInstall}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Install AntiqueRide as a native app: Tap the <strong className="text-slate-900">Share</strong> icon in Safari below, then tap <strong className="text-blue-700">'Add to Home Screen'</strong>.
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Share className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Tap Safari Share</span>
            <span>→</span>
            <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Add to Home Screen</span>
          </div>
        </div>
      )}
    </>
  );
}
