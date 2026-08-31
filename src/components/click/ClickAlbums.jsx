import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ArrowLeft,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings2,
  Image as ImageIcon,
  Sparkles,
  CloudUpload,
  Layers
} from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticsSound';
import { getClickDriveFolderUrl, getClickDriveFolderId, setClickDriveFolderId } from '../../utils/clickDriveConfig';

// Color themes matching Reference Image 3 3D folders
const FOLDER_THEMES = [
  {
    bg: 'from-amber-400 to-orange-500',
    pocket: 'bg-amber-500/80 border-amber-300',
    text: 'text-amber-950',
    badge: 'bg-amber-100 text-amber-900',
    shadow: 'shadow-orange-500/20',
  },
  {
    bg: 'from-blue-400 to-sky-600',
    pocket: 'bg-sky-500/80 border-sky-300',
    text: 'text-sky-950',
    badge: 'bg-sky-100 text-sky-900',
    shadow: 'shadow-sky-500/20',
  },
  {
    bg: 'from-pink-400 to-rose-600',
    pocket: 'bg-rose-500/80 border-rose-300',
    text: 'text-rose-950',
    badge: 'bg-rose-100 text-rose-900',
    shadow: 'shadow-rose-500/20',
  },
  {
    bg: 'from-emerald-400 to-green-600',
    pocket: 'bg-emerald-500/80 border-emerald-300',
    text: 'text-emerald-950',
    badge: 'bg-emerald-100 text-emerald-900',
    shadow: 'shadow-emerald-500/20',
  },
  {
    bg: 'from-purple-400 to-indigo-600',
    pocket: 'bg-indigo-500/80 border-indigo-300',
    text: 'text-indigo-950',
    badge: 'bg-indigo-100 text-indigo-900',
    shadow: 'shadow-indigo-500/20',
  },
  {
    bg: 'from-teal-400 to-cyan-600',
    pocket: 'bg-teal-500/80 border-teal-300',
    text: 'text-teal-950',
    badge: 'bg-teal-100 text-teal-900',
    shadow: 'shadow-teal-500/20',
  },
];

export function ClickAlbums({
  albums = [],
  isLoading = false,
  onSelectAlbum,
  onRefresh,
  onBack,
  onViewAllPhotos,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputDriveUrl, setInputDriveUrl] = useState(getClickDriveFolderUrl());

  const filteredAlbums = albums.filter((alb) =>
    alb.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalMoments = albums.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const handleOpenDrive = () => {
    triggerHaptic(10);
    const driveUrl = getClickDriveFolderUrl();
    window.open(driveUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveDriveConfig = (e) => {
    e.preventDefault();
    triggerHaptic(15);
    setClickDriveFolderId(inputDriveUrl);
    setShowConfigModal(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 select-none">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                if (onBack) onBack();
              }}
              className="p-2 rounded-2xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Albums</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0f52ba] border border-blue-200">
                  {albums.length} Folders
                </span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-500">
                {totalMoments} Total Moments Synced with Google Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                if (onRefresh) onRefresh();
              }}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh from Google Drive"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0f52ba]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 cursor-pointer"
              title="Configure Google Drive Folder Link"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleOpenDrive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload to Drive</span>
            </button>
          </div>

        </div>

        {/* Search & All Photos Quick Filter */}
        <div className="max-w-4xl mx-auto mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search albums (e.g. Laddu Auction, Annadanam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-300 rounded-2xl text-xs font-semibold focus:outline-none transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (onViewAllPhotos) onViewAllPhotos();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#0f52ba]" />
            <span>All Stream</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Loading State */}
        {isLoading && albums.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0f52ba] animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Connecting to Google Drive Archive...</p>
            <p className="text-xs text-slate-400">Fetching subfolders and live uploaded moments</p>
          </div>
        ) : filteredAlbums.length === 0 ? (
          /* Empty State Guide */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-4 shadow-sm my-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#0f52ba]">
              <FolderOpen className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {searchQuery ? 'No Matching Albums Found' : 'No Photos Uploaded Yet'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {searchQuery
                  ? `No album matching "${searchQuery}". Clear your search or create a new subfolder in Google Drive.`
                  : 'Click displays albums and photos directly from your Google Drive folder. Upload images inside subfolders to see them appear here instantly!'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleOpenDrive}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>Open Google Drive to Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Set Drive Folder ID
              </button>
            </div>
          </div>
        ) : (
          /* 3D Skeuomorphic Folder Grid (Ref Image 3) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredAlbums.map((album, idx) => {
              const theme = FOLDER_THEMES[idx % FOLDER_THEMES.length];
              const covers = album.coverImages || [];

              return (
                <div
                  key={album.id || idx}
                  onClick={() => {
                    triggerHaptic(15);
                    if (onSelectAlbum) onSelectAlbum(album);
                  }}
                  className="group flex flex-col items-center cursor-pointer select-none"
                >
                  {/* 3D Folder Body Container */}
                  <div className="relative w-full aspect-square max-w-[190px] mx-auto flex items-center justify-center">
                    
                    {/* Layered Stamp Photos Peeking from Inside (Postage Stamp Scalloped Edge) */}
                    <div className="absolute inset-x-4 top-2 h-3/4 flex items-center justify-center">
                      
                      {/* Back/Left Stack Photo */}
                      <div className="absolute w-[82%] h-[82%] bg-white rounded-xl p-1 shadow-md transform -rotate-6 -translate-y-2 transition-transform duration-300 group-hover:-rotate-10 group-hover:-translate-y-4 overflow-hidden border border-slate-200">
                        {covers[1] ? (
                          <img src={covers[1]} alt="Moment" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Front/Center Stack Photo */}
                      <div className="absolute w-[88%] h-[88%] bg-white rounded-xl p-1.5 shadow-xl transform rotate-2 -translate-y-3 transition-transform duration-300 group-hover:rotate-0 group-hover:-translate-y-6 overflow-hidden border border-slate-200 z-10">
                        {covers[0] ? (
                          <img src={covers[0]} alt="Moment" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Translucent 3D Glossy Folder Pocket (Skeuomorphic Pocket) */}
                    <div
                      className={`absolute inset-x-0 bottom-0 h-[62%] rounded-[26px] bg-gradient-to-b ${theme.bg} p-1.5 shadow-xl ${theme.shadow} border-t-2 border-white/50 backdrop-blur-md z-20 transition-all duration-300 group-hover:scale-102 flex flex-col justify-end overflow-hidden`}
                    >
                      {/* Gloss Highlight Reflection Bar */}
                      <div className="absolute inset-x-3 top-1.5 h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
                      
                      {/* Scalloped Watermark Crest on Pocket */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                        <img src="/click-icon.png" alt="Crest" className="w-24 h-24 object-contain brightness-0 invert" />
                      </div>

                      {/* Pocket Bottom Tab Info */}
                      <div className="relative z-10 p-2 text-center">
                        <span className="inline-block text-[9px] font-black text-white/95 uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {album.count} {album.count === 1 ? 'Moment' : 'Moments'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Album Name & Subtitle Underneath */}
                  <div className="text-center pt-2.5 space-y-0.5 max-w-[180px]">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0f52ba] transition-colors truncate">
                      {album.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {album.count} Moments
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Configure Google Drive Folder Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0f52ba]">
                <CloudUpload className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 text-sm">Google Drive Sync Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste the **Google Drive Master Folder Link or Folder ID** where your subfolders (e.g. *Vinayaka Puja*, *Laddu Auction*) and photos are stored.
            </p>

            <form onSubmit={handleSaveDriveConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Google Drive Folder Link / ID
                </label>
                <input
                  type="text"
                  value={inputDriveUrl}
                  onChange={(e) => setInputDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1abcXYZ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">💡 How it works:</p>
                <ul className="list-disc list-inside text-[10.5px] space-y-0.5 text-blue-800">
                  <li>Create subfolders in this Drive folder for each event.</li>
                  <li>Drop photos into the subfolders.</li>
                  <li>Click will automatically categorize and display them in 3D albums!</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0f52ba] hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                >
                  Save & Sync Drive
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
