import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  computed,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';
import {
  BENTO_GALLERY_IMAGE_IDS,
  SHARED_GALLERY_IMAGES,
  SharedGalleryImageCategory,
} from '../../shared/gallery-images';

type GalleryImage = {
  src: string;
  viewerSrc: string;
  altKey: string;
  labelKey: string;
  revealDelay: number;
  layoutClass: string;
};

@Component({
  selector: 'app-gallery-bento',
  imports: [RouterLink, TranslatePipe, RevealOnScrollDirective],
  templateUrl: './gallery-bento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryBentoComponent implements OnDestroy {
  protected readonly galleryImages: GalleryImage[] = BENTO_GALLERY_IMAGE_IDS.map((id) =>
    SHARED_GALLERY_IMAGES.find((image) => image.id === id)
  )
    .filter((image): image is (typeof SHARED_GALLERY_IMAGES)[number] => Boolean(image))
    .map((image, index) => {
      const meta = this.getBentoMeta(image.category, index);

      return {
        src: image.src,
        viewerSrc: image.viewerSrc,
        altKey: meta.altKey,
        labelKey: meta.labelKey,
        revealDelay: 40 + index * 40,
        layoutClass: meta.layoutClass,
      };
    });

  protected readonly activeImageIndex = signal<number | null>(null);
  protected readonly isViewerOpen = computed(() => this.activeImageIndex() !== null);
  protected readonly activeImage = computed(() => {
    const index = this.activeImageIndex();
    if (index === null) {
      return null;
    }

    return this.galleryImages[index] ?? null;
  });
  protected readonly activeImagePosition = computed(() => {
    const index = this.activeImageIndex();
    if (index === null) {
      return 0;
    }

    return index + 1;
  });

  private readonly canUseBrowserApis: boolean;
  private previousBodyOverflow = '';

  constructor(
    private readonly translate: TranslateService,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.canUseBrowserApis = isPlatformBrowser(platformId);
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  protected get galleryRoute(): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language, 'galeria'];
  }

  protected openViewer(index: number): void {
    this.activeImageIndex.set(index);
    this.lockScroll();
  }

  protected closeViewer(): void {
    this.activeImageIndex.set(null);
    this.unlockScroll();
  }

  protected showPreviousImage(): void {
    const currentIndex = this.activeImageIndex();
    if (currentIndex === null) {
      return;
    }

    const nextIndex = (currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.activeImageIndex.set(nextIndex);
  }

  protected showNextImage(): void {
    const currentIndex = this.activeImageIndex();
    if (currentIndex === null) {
      return;
    }

    const nextIndex = (currentIndex + 1) % this.galleryImages.length;
    this.activeImageIndex.set(nextIndex);
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected trackImage(index: number, image: GalleryImage): string {
    return `${image.src}-${index}`;
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (this.activeImageIndex() === null) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeViewer();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.showPreviousImage();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.showNextImage();
    }
  }

  private lockScroll(): void {
    if (!this.canUseBrowserApis) {
      return;
    }

    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if (!this.canUseBrowserApis) {
      return;
    }

    this.document.body.style.overflow = this.previousBodyOverflow;
  }

  private getBentoMeta(
    category: SharedGalleryImageCategory,
    index: number
  ): { altKey: string; labelKey: string; layoutClass: string } {
    const isHero = index === 0 || index % 7 === 0;
    const isTall = !isHero && (index % 5 === 0);
    const isWide = !isHero && !isTall && (index % 3 === 1);

    let layoutClass = '';

    if (isHero) {
      layoutClass = 'sm:col-span-2 lg:row-span-2';
    } else if (isTall) {
      layoutClass = 'lg:row-span-2';
    } else if (isWide) {
      layoutClass = 'sm:col-span-2';
    }

    switch (category) {
      case 'terrace':
        layoutClass = 'sm:col-span-2 lg:row-span-2';
        break;
      case 'coast':
      case 'views':
        layoutClass = 'sm:col-span-2';
        break;
    }

    switch (category) {
      case 'living':
        return { altKey: 'gallery.alt.living', labelKey: 'gallery.labels.living', layoutClass };
      case 'bedroom':
        return { altKey: 'gallery.alt.bedroom', labelKey: 'gallery.labels.bedroom', layoutClass };
      case 'kitchen':
        return { altKey: 'gallery.alt.kitchen', labelKey: 'gallery.labels.kitchen', layoutClass };
      case 'terrace':
        return { altKey: 'gallery.alt.terrace', labelKey: 'gallery.labels.terrace', layoutClass };
      case 'bathroom':
        return { altKey: 'gallery.alt.bathroom', labelKey: 'gallery.labels.bathroom', layoutClass };
      case 'exterior':
        return { altKey: 'gallery.alt.exterior', labelKey: 'gallery.labels.exterior', layoutClass };
      case 'views':
        return { altKey: 'gallery.alt.views', labelKey: 'gallery.labels.views', layoutClass };
      case 'interior':
        return { altKey: 'gallery.alt.cozy', labelKey: 'gallery.labels.cozy', layoutClass };
      case 'coast':
        return { altKey: 'gallery.alt.beach', labelKey: 'gallery.labels.beach', layoutClass };
      case 'room':
        return { altKey: 'gallery.alt.room', labelKey: 'gallery.labels.room', layoutClass };
    }
  }
}

