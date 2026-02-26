/**
 * Video configuration for the ImmoRefi Portal
 * Videos are hosted on Vidyard
 */

export interface VideoConfig {
  id: string;
  title: string;
  vidyardUUID: string;
  thumbnail?: string;
}

/**
 * Featured videos displayed on the homepage
 *
 * To get the Vidyard UUID:
 * 1. Go to your Vidyard video
 * 2. Copy the video URL: https://play.vidyard.com/{UUID}
 * 3. Extract the UUID from the URL
 */
export const featuredVideos: VideoConfig[] = [
  {
    id: 'intro',
    title: 'ImmoRefi Einführung',
    vidyardUUID: 'X5zZWG7NyKg9LzkGPDZn46',
    thumbnail: undefined, // Vidyard auto-generates thumbnails
  },
  {
    id: 'process',
    title: 'Unser Prozess',
    vidyardUUID: 'PLACEHOLDER_UUID_2',
    thumbnail: undefined,
  },
  {
    id: 'success-story',
    title: 'Erfolgsgeschichte',
    vidyardUUID: 'PLACEHOLDER_UUID_3',
    thumbnail: undefined,
  },
];
