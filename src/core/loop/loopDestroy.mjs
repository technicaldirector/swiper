import { elementChildren } from '../../shared/utils.mjs';

export default function loopDestroy() {
  const swiper = this;
  const { params, slidesEl } = swiper;
  if (!slidesEl) return;

  // Remove any duplicates added by loopFillSlides / loopFillSlidesCount. Done
  // before the loop guard so disabling loop (params.loop already false here when
  // toggled via breakpoints) still restores the original slide set.
  const fillSlides = elementChildren(slidesEl, `.${params.slideFillClass}`);
  if (fillSlides.length) {
    fillSlides.forEach((el) => el.remove());
    swiper.recalcSlides();
  }

  if (!params.loop || (swiper.virtual && swiper.params.virtual.enabled)) return;
  swiper.recalcSlides();

  const newSlidesOrder = [];
  swiper.slides.forEach((slideEl) => {
    const index =
      typeof slideEl.swiperSlideIndex === 'undefined'
        ? slideEl.getAttribute('data-swiper-slide-index') * 1
        : slideEl.swiperSlideIndex;
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
