export type SharedGalleryImageCategory =
  | 'terrace'
  | 'kitchen'
  | 'living'
  | 'bedroom'
  | 'room'
  | 'bathroom'
  | 'exterior'
  | 'views'
  | 'coast'
  | 'interior';

export type SharedGalleryImage = {
  id: string;
  category: SharedGalleryImageCategory;
  src: string;
  viewerSrc: string;
};

const buildLocalImage = (fileName: string, category: SharedGalleryImageCategory): SharedGalleryImage => ({
  id: `photo-${fileName.replace(/\.[^.]+$/, '').padStart(2, '0')}`,
  category,
  src: `/gallery/${fileName}`,
  viewerSrc: `/gallery/${fileName}`,
});

export const SHARED_GALLERY_IMAGES: SharedGalleryImage[] = [
  buildLocalImage('1.avif', 'interior'),
  buildLocalImage('4.jpg', 'terrace'),
  buildLocalImage('5.jpg', 'kitchen'),
  buildLocalImage('6.jpg', 'living'),
  buildLocalImage('7.jpg', 'kitchen'),
  buildLocalImage('8.jpeg', 'bedroom'),
  buildLocalImage('9.jpg', 'bedroom'),
  buildLocalImage('12.jpeg', 'room'),
  buildLocalImage('13.jpg', 'room'),
  buildLocalImage('15.jpg', 'bathroom'),
  buildLocalImage('16.jpg', 'bathroom'),
  buildLocalImage('18.jpg', 'kitchen'),
  buildLocalImage('21.jpg', 'bathroom'),
  buildLocalImage('24.jpeg', 'living'),
  buildLocalImage('25.jpeg', 'living'),
  buildLocalImage('26.jpg', 'exterior'),
  buildLocalImage('28.jpg', 'views'),
  buildLocalImage('29.jpg', 'coast'),
  buildLocalImage('2.avif', 'interior'),
  buildLocalImage('3.avif', 'living'),
  buildLocalImage('14.avif', 'bathroom'),
  buildLocalImage('17.avif', 'kitchen'),
  buildLocalImage('19.avif', 'interior'),
  buildLocalImage('20.avif', 'interior'),
  buildLocalImage('22.avif', 'views'),
  buildLocalImage('23.avif', 'living'),
  buildLocalImage('27.avif', 'exterior'),
  buildLocalImage('30.avif', 'coast'),
];

export const BENTO_GALLERY_IMAGE_IDS = [
  'photo-01',
  'photo-02',
  'photo-03',
  'photo-04',
  'photo-05',
  'photo-06',
  'photo-07',
  'photo-08',
  'photo-09',
  'photo-12',
  'photo-13',
  'photo-14',
  'photo-15',
  'photo-16',
  'photo-17',
  'photo-18',
  'photo-19',
  'photo-20',
  'photo-21',
  'photo-22',
  'photo-23',
  'photo-24',
  'photo-25',
  'photo-26',
  'photo-27',
  'photo-28',
  'photo-29',
  'photo-30',
];
