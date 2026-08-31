import React, { useState, useEffect } from 'react';
import { ClickWelcome } from './ClickWelcome';
import { ClickAlbums } from './ClickAlbums';
import { ClickGallery } from './ClickGallery';
import { ClickLightbox } from './ClickLightbox';
import { api } from '../../services/api';
import { getClickDriveFolderId, getClickDriveFolderUrl } from '../../utils/clickDriveConfig';

export function ClickApp({ onBackToLogin }) {
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome' | 'albums' | 'gallery'
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);
  const [lightboxPhotoList, setLightboxPhotoList] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch gallery data from Drive backend
  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const folderId = getClickDriveFolderId();
      const res = await api.getClickGallery(folderId);
      if (res && res.success && Array.isArray(res.albums)) {
        setAlbums(res.albums);
      } else {
        setAlbums([]);
      }
    } catch (err) {
      console.warn('Error fetching Click gallery', err);
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const handleOpenAlbum = (album) => {
    setSelectedAlbum(album);
    setCurrentView('gallery');
  };

  const handleViewAllPhotos = () => {
    setSelectedAlbum(null);
    setCurrentView('gallery');
  };

  const handleOpenPhoto = (photo, list, index) => {
    setActiveLightboxPhoto(photo);
    setLightboxPhotoList(list || []);
    setLightboxIndex(index || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {currentView === 'welcome' && (
        <ClickWelcome
          onContinue={() => setCurrentView('albums')}
          onBackToTracker={onBackToLogin}
        />
      )}

      {currentView === 'albums' && (
        <ClickAlbums
          albums={albums}
          isLoading={isLoading}
          onSelectAlbum={handleOpenAlbum}
          onRefresh={fetchGalleryData}
          onBack={() => setCurrentView('welcome')}
          onViewAllPhotos={handleViewAllPhotos}
        />
      )}

      {currentView === 'gallery' && (
        <ClickGallery
          albums={albums}
          selectedAlbum={selectedAlbum}
          onBackToAlbums={() => setCurrentView('albums')}
          onSelectPhoto={handleOpenPhoto}
        />
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxPhoto && (
        <ClickLightbox
          photo={activeLightboxPhoto}
          photoList={lightboxPhotoList}
          currentIndex={lightboxIndex}
          onClose={() => setActiveLightboxPhoto(null)}
        />
      )}

    </div>
  );
}
