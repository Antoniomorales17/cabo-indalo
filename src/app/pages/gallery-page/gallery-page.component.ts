import {
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
import { FooterComponent } from '../../components/footer/footer.component';
import { SHARED_GALLERY_IMAGES } from '../../shared/gallery-images';

@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, FooterComponent, TranslatePipe],
  templateUrl: './gallery-page.component.html',
})
export class GalleryPageComponent implements OnDestroy {
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

  protected get homeRoute(): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language];
  }

  protected readonly galleryImages = SHARED_GALLERY_IMAGES.map((image) => ({
    src: image.src,
    altKey: `galleryPage.alt.${image.id}`,
  }));

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

  protected trackImage(index: number, image: (typeof this.galleryImages)[number]): string {
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
}
