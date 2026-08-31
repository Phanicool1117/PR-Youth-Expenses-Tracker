import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  SlidersHorizontal,
  Search,
  Download,
  Share2,
  Calendar,
  Sparkles,
  CloudUpload,
  Layers,
  Image as ImageIcon,
  FolderOpen,
  X
} from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticsSound';
import { getClickDriveFolderUrl } from '../../utils/clickDriveConfig';

export function ClickGallery({
  albums = [],
  selectedAlbum = null,
  onBackToAlbums,
  onSelectPhoto,
  onOpenDrive,
}) {
  const [activeFilter, setActiveFilter] = useState(selectedAlbum ? selectedAlbum.id : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Flatten all photos or filter by active album
  const allPhotos = useMemo(() => {
    let list = [];
    albums.forEach((alb) => {
      if (alb.photos && Array.isArray(alb.photos)) {
        list = list.concat(alb.photos);
      }
    });
    return list;
  }, [albums]);

  const displayedPhotos = useMemo(() => {
    let filtered = activeFilter === 'all'
      ? allPhotos
      : (albums.find((a) => a.id === activeFilter)?.photos || []);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.folderName && p.folderName.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [activeFilter, allPhotos, albums, searchQuery]);

  // Group photos by Month or Folder Category for timeline sections (Ref Image 4)
  const groupedSections = useMemo(() => {
    const groups = {};
    displayedPhotos.forEach((photo) => {
      let groupKey = photo.folderName || 'General';
      if (photo.createdTime) {
        try {
          const d = new Date(photo.createdTime);
          if (!isNaN(d.getTime())) {
            groupKey = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }
        } catch (e) {}
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(photo);
    });
    return groups;
  }, [displayedPhotos]);

  const handleDriveUploadClick = () => {
    triggerHaptic(10);
    const url = getClickDriveFolderUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 select-none">
      
      {/* Top Header Toolbar (Ref Image 4) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                if (onBackToAlbums) onBackToAlbums();
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeFilter === 'all'
                ? 'Gallery'
                : albums.find((a) => a.id === activeFilter)?.name || 'Gallery'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowSearchInput(!showSearchInput);
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleDriveUploadClick}
              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0f52ba] transition-colors cursor-pointer"
              title="Upload Photos to Google Drive"
            >
              <CloudUpload className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Search Input Bar (Toggled) */}
        {showSearchInput && (
          <div className="max-w-4xl mx-auto mt-2 relative animate-in fade-in-50 duration-150">
            <input
              type="text"
              placeholder="Search photo name or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full px-4 py-2 bg-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Horizontal Category / Album Filter Chips */}
        <div className="max-w-4xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#18181b] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Moments ({allPhotos.length})
          </button>

          {albums.map((alb) => (
            <button
              key={alb.id}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveFilter(alb.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === alb.id
                  ? 'bg-[#0f52ba] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {alb.name} ({alb.count})
            </button>
          ))}
        </div>
      </header>

      {/* Main Gallery Bento Masonry Grid (Ref Image 4) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        
        {displayedPhotos.length === 0 ? (
          /* Empty State when no photos in Drive */
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 my-8 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#0f52ba]">
              <ImageIcon className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                No Photos in this Album Yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Photos uploaded to your Google Drive folder will appear here automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDriveUploadClick}
              className="px-5 py-2.5 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Upload Photos to Drive</span>
            </button>
          </div>
        ) : (
          /* Timeline Sections */
          Object.entries(groupedSections).map(([sectionTitle, photos]) => (
            <section key={sectionTitle} className="mb-8">
              
              {/* Section Header (Month / Category) */}
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-3">
                {sectionTitle}
              </h2>

              {/* Bento Masonry Grid matching Ref Image 4 */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 auto-rows-[90px] sm:auto-rows-[120px]">
                {photos.map((photo, pIdx) => {
                  // Dynamic Bento spanning logic for rich organic aesthetic
                  const isHero = pIdx % 9 === 0;
                  const isTall = pIdx % 7 === 2;
                  const isWide = pIdx % 11 === 4;

                  let spanClass = 'col-span-1 row-span-1';
                  if (isHero && photos.length > 2) spanClass = 'col-span-2 row-span-2';
                  else if (isTall) spanClass = 'col-span-1 row-span-2';
                  else if (isWide) spanClass = 'col-span-2 row-span-1';

                  return (
                    <div
                      key={photo.id || pIdx}
                      onClick={() => {
                        triggerHaptic(15);
                        if (onSelectPhoto) onSelectPhoto(photo, displayedPhotos, pIdx);
                      }}
                      className={`relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300 active:scale-98 ${spanClass}`}
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={photo.thumbnailUrl || photo.fullUrl}
                        alt={photo.name || 'Moment'}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Hover Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                        <p className="text-[10px] font-bold text-white truncate drop-shadow">
                          {photo.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          ))
        )}

      </main>

    </div>
  );
}
