export type SharedGalleryImageId =
  | 'sunrise'
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'terrace'
  | 'coast'
  | 'interior'
  | 'room';

export type SharedGalleryImage = {
  id: SharedGalleryImageId;
  src: string;
  srcSet: string;
  viewerSrc: string;
};

const UNSPLASH_PARAMS = 'auto=format,compress&fit=crop&q=50';

const buildUnsplashImage = (photoId: string): Omit<SharedGalleryImage, 'id'> => {
  const buildUrl = (width: number) => `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}&w=${width}`;
  const widths = [320, 480, 640, 800];
  return {
    src: buildUrl(480),
    srcSet: widths.map((width) => `${buildUrl(width)} ${width}w`).join(', '),
    viewerSrc: buildUrl(1280),
  };
};

export const SHARED_GALLERY_IMAGES: SharedGalleryImage[] = [
  {
    id: 'living',
    ...buildUnsplashImage('photo-1473116763249-2faaef81ccda'),
  },
  {
    id: 'bedroom',
    ...buildUnsplashImage('photo-1496417263034-38ec4f0b665a'),
  },
  {
    id: 'kitchen',
    ...buildUnsplashImage('photo-1523413651479-597eb2da0ad6'),
  },
  {
    id: 'terrace',
    ...buildUnsplashImage('photo-1507089947368-19c1da9775ae'),
  },
  {
    id: 'interior',
    ...buildUnsplashImage('photo-1512918728675-ed5a9ecdebfd'),
  },
  {
    id: 'coast',
    ...buildUnsplashImage('photo-1500375592092-40eb2168fd21'),
  },
  {
    id: 'sunrise',
    ...buildUnsplashImage('photo-1507525428034-b723cf961d3e'),
  },
  {
    id: 'room',
    ...buildUnsplashImage('photo-1505693416388-ac5ce068fe85'),
  },
];
