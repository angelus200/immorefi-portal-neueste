import { useState } from 'react';
import { videos } from '@/config/videos';
import { Play } from 'lucide-react';

/**
 * VideoSection Component
 *
 * Displays a featured video player with a horizontal thumbnail gallery.
 * - Main video player: Full-width, 16:9 aspect ratio
 * - Thumbnail gallery: Horizontal scroll with active indicator
 * - Click thumbnail to switch main video (inline, no popup)
 * - Responsive: Stacks vertically on mobile
 */
export function VideoSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (videos.length === 0) {
    return null;
  }

  const activeVideo = videos[activeVideoIndex];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-gray-50 dark:to-gray-950/50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Play className="h-4 w-4" />
            Video Bibliothek
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Erfahren Sie mehr über <span className="text-primary">ImmoRefi</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ausgewählte Videos zu unseren Leistungen und Erfolgsgeschichten
          </p>
        </div>

        {/* Main Video Player */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/10">
            {/* 16:9 Aspect Ratio Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                key={activeVideo.id}
                className="absolute inset-0 w-full h-full"
                src={`https://play.vidyard.com/${activeVideo.vidyardUUID}?autoplay=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Active Video Title */}
          <div className="mt-4 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              {activeVideo.title}
            </h3>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {videos.length > 1 && (
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4 min-w-min px-1">
                  {videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideoIndex(index)}
                      className={`
                        group relative flex-shrink-0 w-48 rounded-lg overflow-hidden
                        transition-all duration-300 hover:scale-105
                        ${
                          index === activeVideoIndex
                            ? 'ring-4 ring-primary shadow-lg'
                            : 'ring-2 ring-gray-200 dark:ring-gray-800 hover:ring-primary/50'
                        }
                      `}
                      aria-label={`Video abspielen: ${video.title}`}
                    >
                      {/* Thumbnail - 16:9 Aspect Ratio */}
                      <div className="relative w-full bg-gray-100 dark:bg-gray-900" style={{ paddingBottom: '56.25%' }}>
                        {/* Vidyard Thumbnail Image */}
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                            <Play className="h-6 w-6 text-primary fill-primary" />
                          </div>
                        </div>

                        {/* Active Indicator Overlay */}
                        {index === activeVideoIndex && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              Wird abgespielt
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Label */}
                      <div className="p-2 bg-white dark:bg-gray-900 border-t-2 border-gray-100 dark:border-gray-800">
                        <p className={`
                          text-xs font-medium text-center line-clamp-2
                          ${index === activeVideoIndex ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}
                        `}>
                          {video.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scroll Hint - Only on Desktop */}
              {videos.length > 4 && (
                <div className="hidden md:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              )}
            </div>

            {/* Video Counter */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Video {activeVideoIndex + 1} von {videos.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Hide */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
