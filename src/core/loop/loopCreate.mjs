import { createElement, elementChildren, showWarning } from '../../shared/utils.mjs';

export default function loopCreate(slideRealIndex, initial) {
  const swiper = this;
  const { params, slidesEl } = swiper;
  if (!params.loop || (swiper.virtual && swiper.params.virtual.enabled)) return;

  // Duplicate real slides so loop mode has enough of them. Loop rearranges the
  // actual slides, so with too few it shows empty/jumpy frames. `loopFillSlides`
  // fills automatically from slidesPerView; `loopFillSlidesCount` repeats the
  // whole set a fixed number of extra times. Fills are tagged with
  // `slideFillClass` and stripped again in loopDestroy so toggling loop (e.g. via
  // breakpoints) restores the original set.
  const fillLoopSlides = () => {
    // Start from a clean set so re-creating the loop never multiplies duplicates.
    elementChildren(slidesEl, `.${params.slideFillClass}`).forEach((el) => el.remove());

    const manual = params.loopFillSlidesCount > 0;
    if (!params.loopFillSlides && !manual) return;

    const originalSlides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const baseLength = originalSlides.length;
    if (baseLength === 0) return;

    let targetCount;
    if (manual) {
      // Repeat the whole set `loopFillSlidesCount` extra times.
      targetCount = baseLength * (params.loopFillSlidesCount + 1);
    } else {
      if (params.slidesPerView === 'auto') {
        showWarning(
          'Swiper loopFillSlides: cannot auto-fill with slidesPerView "auto". Set loopFillSlidesCount to fill manually.',
        );
        return;
      }
      // Need the visible width plus room for the rearranged slides on each side.
      const minNeeded = Math.ceil(params.slidesPerView) * 2 + 1;
      if (baseLength >= minNeeded) return;
      targetCount = minNeeded;
    }

    const stateClasses = [
      params.slideActiveClass,
      params.slideNextClass,
      params.slidePrevClass,
      params.slideVisibleClass,
      params.slideFullyVisibleClass,
      params.slideBlankClass,
    ];

    let added = 0;
    while (baseLength + added < targetCount) {
      const fillEl = originalSlides[added % baseLength].cloneNode(true);
      fillEl.classList.add(params.slideFillClass);
      fillEl.classList.remove(...stateClasses);
      fillEl.removeAttribute('data-swiper-slide-index');
      slidesEl.append(fillEl);
      added += 1;
    }

    if (added > 0) {
      swiper.recalcSlides();
      swiper.updateSlides();
    }
  };

  fillLoopSlides();

  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);

    slides.forEach((el, index) => {
      el.setAttribute('data-swiper-slide-index', index);
    });
  };

  const clearBlankSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);

    slides.forEach((el) => {
      el.remove();
    });
    if (slides.length > 0) {
      swiper.recalcSlides();
      swiper.updateSlides();
    }
  };

  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
    clearBlankSlides();
  }

  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);

  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;

  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement
        ? createElement('swiper-slide', [params.slideBlankClass])
        : createElement('div', [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };

  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - (swiper.slides.length % slidesPerGroup);
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning(
        'Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)',
      );
    }

    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - (swiper.slides.length % params.grid.rows);
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning(
        'Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)',
      );
    }
    initSlides();
  } else {
    initSlides();
  }

  const bothDirections =
    params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
  swiper.loopFix({
    slideRealIndex,
    direction: bothDirections ? undefined : 'next',
    initial,
  });
}
