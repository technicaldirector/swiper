import { elementChildren } from '../../shared/utils';
import type { Swiper } from '../core';

// Loop module re-orders slides and stashes their original index in this
// runtime property so we can rebuild the source order on destroy.
interface LoopSlideEl extends HTMLElement {
  swiperSlideIndex?: number;
}

export default function loopDestroy(this: Swiper): void {
  const swiper = this;
  const { params, slidesEl } = swiper;
  if (!slidesEl) return;

  // Remove any duplicates added by loopFillSlides / loopFillSlidesCount. Done
  // before the loop guard so disabling loop (params.loop is already false here
  // when toggled via breakpoints) still restores the original slide set.
  const fillSlides = elementChildren(slidesEl, `.${params.slideFillClass ?? 'swiper-slide-fill'}`);
  if (fillSlides.length) {
    fillSlides.forEach((el) => el.remove());
    swiper.recalcSlides();
  }

  if (!params.loop || (swiper.virtual && swiper.params.virtual?.enabled)) return;
  swiper.recalcSlides();

  const newSlidesOrder: HTMLElement[] = [];
  swiper.slides.forEach((slideEl) => {
    const loopSlideEl = slideEl as LoopSlideEl;
    const index =
      typeof loopSlideEl.swiperSlideIndex === 'undefined'
        ? Number(slideEl.getAttribute('data-swiper-slide-index'))
        : loopSlideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach((slideEl) => {
    slideEl.removeAttribute('data-swiper-slide-index');
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
