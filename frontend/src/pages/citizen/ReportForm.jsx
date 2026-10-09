import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citizenApi } from '../../services/api';
import { compressImage, validateImageFile } from '../../utils/imageUtils';

const MAX_IMAGE_SIZE_KB = 50;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export function ReportForm() {
  const { isCitizen } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSizeKB, setImageSizeKB] = useState(null);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file, MAX_IMAGE_SIZE_KB, ALLOWED_TYPES);
    if (validationError) {
      setImageError(validationError);
      setImageFile(null);
      setCompressedImage(null);
      setImagePreview(null);
      setImageSizeKB(null);
      return;
    }

    setImageError('');
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const compressed = await compressImage(file, MAX_IMAGE_SIZE_KB);
      setCompressedImage(compressed);
      setImageSizeKB(compressed.size / 1024);
    } catch (err) {
      setImageError('Failed to compress image. Please try a smaller image.');
      setCompressedImage(null);
      setImageSizeKB(null);
    }
  }, []);

  const handleRemoveImage = () => {
    setImageFile(null);
    setCompressedImage(null);
    setImagePreview(null);
    setImageSizeKB(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitSuccess(false);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (!locationText.trim()) {
      setError('Location is required');
      return;
    }

    if (googleMapsUrl && !googleMapsUrl.includes('google.com/maps') && !googleMapsUrl.includes('goo.gl/maps')) {
      setError('Please provide a valid Google Maps URL');
      return;
    }

    setIsLoading(true);

    try {
      const reportData = {
        title: title.trim(),
        description: description.trim() || undefined,
        locationText: locationText.trim(),
        googleMapsUrl: googleMapsUrl.trim() || undefined,
      };

      if (compressedImage) {
        reportData.imageBase64 = compressedImage.base64;
        reportData.imageFileName = compressedImage.name;
        reportData.imageContentType = compressedImage.type;
      }

      const result = await citizenApi.createReport(reportData);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/citizen/reports/${result.report.id}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error('[CITIZEN REPORT] API ERROR:', err);
      console.error('[CITIZEN REPORT] ERROR MESSAGE:', err.message);
      console.error('[CITIZEN REPORT] ERROR NAME:', err.name);
      console.error('[CITIZEN REPORT] ERROR STATUS:', err.status);
      console.error('[CITIZEN REPORT] ERROR DATA:', err.data);
      
      // Show friendly UI message but log real error for debugging
      setError(err.message || 'Failed to create report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCitizen) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold text-surface-900">Report a Problem</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700" role="alert">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Report submitted successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700" role="alert">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div>
            <label htmlFor="title" className="label">Subject / Title <span className="text-red-500">*</span></label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Large pothole near school entrance"
              required
              maxLength={100}
              disabled={isLoading}
            />
            <p className="text-xs text-surface-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label htmlFor="description" className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px] resize-y"
              placeholder="Describe the road problem in detail..."
              required
              maxLength={2000}
              disabled={isLoading}
            />
            <p className="text-xs text-surface-500 mt-1">{description.length}/2000</p>
          </div>

          <div>
            <label htmlFor="locationText" className="label">Location / Address <span className="text-red-500">*</span></label>
            <input
              id="locationText"
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="input"
              placeholder="XYZ Road, Jaipur"
              required
              maxLength={200}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="googleMapsUrl" className="label">Google Maps Link</label>
            <input
              id="googleMapsUrl"
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="input"
              placeholder="https://maps.google.com/?q=26.9124,75.7873"
              disabled={isLoading}
            />
            <p className="text-xs text-surface-500 mt-1">Paste a Google Maps link for the exact location (optional)</p>
          </div>

          <div>
            <label className="label">Road Image <span className="text-red-500">*</span></label>
            <div className="border-2 border-dashed border-surface-300 rounded-xl p-6 transition-colors hover:border-primary-400">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">{imageFile?.name}</span>
                    <span className={`font-medium ${imageSizeKB && imageSizeKB > MAX_IMAGE_SIZE_KB ? 'text-red-600' : 'text-green-600'}`}>
                      {imageSizeKB ? `${imageSizeKB.toFixed(1)} KB` : 'Compressing...'}
                    </span>
                  </div>
                  {imageSizeKB && imageSizeKB > MAX_IMAGE_SIZE_KB && (
                    <p className="text-red-600 text-xs">Image exceeds 50 KB limit. Please choose a smaller image.</p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-surface-600">Click or drag to upload a road image</p>
                  <p className="text-xs text-surface-500 mt-1">JPG, PNG &nbsp;•&nbsp; Max 50 KB after compression</p>
                  <input
                    ref={fileInputRef}
                    id="imageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline mt-4"
                    disabled={isLoading}
                  >
                    Choose File
                  </button>
                </div>
              )}
              {imageError && (
                <p className="text-red-600 text-sm mt-2">{imageError}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isLoading || (imageSizeKB && imageSizeKB > MAX_IMAGE_SIZE_KB)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="btn-outline flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}