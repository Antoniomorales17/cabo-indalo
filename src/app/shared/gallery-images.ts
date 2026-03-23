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
};

export const SHARED_GALLERY_IMAGES: SharedGalleryImage[] = [
  {
    id: 'living',
    src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'bedroom',
    src: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'kitchen',
    src: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'terrace',
    src: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'interior',
    src: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'coast',
    src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'sunrise',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'room',
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  },
];
