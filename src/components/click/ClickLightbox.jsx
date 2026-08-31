import React, { useState, useEffect } from 'react';
import { X, Download, Share2, ChevronLeft, ChevronRight, ExternalLink, Calendar, Folder } from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticsSound';
import { formatDate } from '../../utils/formatters';

export function ClickLightbox({
  photo,
  photoList = [],
  currentIndex = 0,
  onClose,
  onNext,
  onPrev,
}) {
  const [currentIdx, setCurrentIdx] = useState(currentIndex);

  useEffect(() => {
    setCurrentIdx(currentIndex);
  }, [currentIndex]);

  const activePhoto = photoList[currentIdx] || photo;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIdx < photoList.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentIdx > 0) {
        setCurrentIdx((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, photoList, onClose]);

  if (!activePhoto) return null;

  const handleDownload = async () => {
    triggerHaptic(15);
    try {
      const a = document.createElement('a');
      a.href = activePhoto.fullUrl || activePhoto.thumbnailUrl;
      a.download = activePhoto.name || `Click_Moment_${Date.now()}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(activePhoto.fullUrl || activePhoto.thumbnailUrl, '_blank');
    }
  };

  const handleShare = async () => {
    triggerHaptic(15);
    const shareText = `✨ *Penumuli Perantalamma Youth - Festival Memory*\n📸 ${activePhoto.name || 'Moment'}\n📁 Album: ${activePhoto.folderName || 'General'}\n\nView on Google Drive: ${activePhoto.driveViewUrl || activePhoto.fullUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Penumuli Youth Festival Moment',
          text: shareText,
          url: activePhoto.fullUrl || activePhoto.driveViewUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error', err);
        }
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in select-none">
      
      {/* Top Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
        
        <div className="flex items-center gap-2 max-w-[60%]">
          <span className="text-xs font-bold text-white/90 truncate">
            {activePhoto.name || 'Moment'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white/80 font-semibold shrink-0">
            {currentIdx + 1} / {photoList.length || 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Share Moment"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Download Original"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Main Image Stage */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-10">
        <img
          src={activePhoto.fullUrl || activePhoto.thumbnailUrl}
          alt={activePhoto.name || 'Fullscreen Moment'}
          className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl drop-shadow-2xl animate-scale-up"
        />
      </div>

      {/* Navigation Arrows */}
      {photoList.length > 1 && (
        <>
          {currentIdx > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setCurrentIdx((prev) => prev - 1);
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentIdx < photoList.length - 1 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setCurrentIdx((prev) => prev + 1);
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white/80 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activePhoto.folderName && (
            <span className="flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>{activePhoto.folderName}</span>
            </span>
          )}
          {activePhoto.createdTime && (
            <span className="flex items-center gap-1 text-white/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(activePhoto.createdTime)}</span>
            </span>
          )}
        </div>

        {activePhoto.driveViewUrl && (
          <a
            href={activePhoto.driveViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold hover:underline"
          >
            <span>Drive View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

    </div>
  );
}
