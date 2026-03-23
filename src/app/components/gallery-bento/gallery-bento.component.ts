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
import { SHARED_GALLERY_IMAGES, SharedGalleryImageId } from '../../shared/gallery-images';

type GalleryImage = {
  src: string;
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
  protected readonly galleryImages: GalleryImage[] = SHARED_GALLERY_IMAGES.map((image, index) => {
    const meta = this.getBentoMeta(image.id);

    return {
      src: image.src,
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

  private getBentoMeta(id: SharedGalleryImageId): { altKey: string; labelKey: string; layoutClass: string } {
    switch (id) {
      case 'living':
        return {
          altKey: 'gallery.alt.living',
          labelKey: 'gallery.labels.living',
          layoutClass: 'sm:col-span-2 lg:row-span-2',
        };
      case 'bedroom':
        return { altKey: 'gallery.alt.bedroom', labelKey: 'gallery.labels.bedroom', layoutClass: '' };
      case 'kitchen':
        return { altKey: 'gallery.alt.kitchen', labelKey: 'gallery.labels.kitchen', layoutClass: '' };
      case 'terrace':
        return { altKey: 'gallery.alt.terrace', labelKey: 'gallery.labels.terrace', layoutClass: 'sm:col-span-2' };
      case 'interior':
        return { altKey: 'gallery.alt.cozy', labelKey: 'gallery.labels.cozy', layoutClass: '' };
      case 'coast':
        return { altKey: 'gallery.alt.beach', labelKey: 'gallery.labels.beach', layoutClass: '' };
      case 'sunrise':
        return { altKey: 'gallery.alt.sunrise', labelKey: 'gallery.labels.sunrise', layoutClass: 'sm:col-span-2' };
      case 'room':
        return { altKey: 'gallery.alt.room', labelKey: 'gallery.labels.room', layoutClass: '' };
    }
  }
}

