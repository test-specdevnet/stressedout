import type { CSSProperties } from "react";
import type { StoryDirection } from "../hooks/useStoryScroll";

export const STORY_WHEEL_CONSTANTS = {
  STEP_ANGLE_DEG: 15,
  VISIBLE_SLOT_RANGE: 1.02,
  SCALE_PER_SLOT: 0.085,
  OPACITY_PER_SLOT: 1.18,
  BLUR_PER_SLOT: 2.8,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getWrappedDistance(index: number, anchorIndex: number, total: number) {
  const raw = index - anchorIndex;
  const wrapped = ((raw % total) + total) % total;
  return wrapped > total / 2 ? wrapped - total : wrapped;
}

export function getRelativeWheelSlot(
  index: number,
  activeIndex: number,
  total: number,
  isTransitioning: boolean,
  fromIndex: number | null,
  stepProgress: number,
  direction: StoryDirection,
) {
  if (!isTransitioning || fromIndex === null) {
    return getWrappedDistance(index, activeIndex, total);
  }

  const initialSlot = getWrappedDistance(index, fromIndex, total);
  const step = direction === "forward" ? 1 : -1;
  return initialSlot - stepProgress * step;
}

type PanelWheelState = {
  isVisible: boolean;
  isCenter: boolean;
  relativeSlot: number;
  slotName: string;
  style: CSSProperties;
};

export function getPanelWheelState(relativeSlot: number): PanelWheelState {
  const distance = Math.abs(relativeSlot);
  const isVisible = distance <= STORY_WHEEL_CONSTANTS.VISIBLE_SLOT_RANGE;
  const isCenter = distance < 0.36;
  const roundedSlot = Math.round(relativeSlot);
  const slotName =
    !isVisible
      ? "hidden"
      : roundedSlot === 0
        ? "center"
        : roundedSlot < 0
          ? `prev-${Math.abs(roundedSlot)}`
          : `next-${roundedSlot}`;

  const scale = clamp(1 - distance * STORY_WHEEL_CONSTANTS.SCALE_PER_SLOT, 0.86, 1);
  const opacity =
    distance < 0.22
      ? 1
      : clamp(1 - Math.pow(distance, 1.55) * STORY_WHEEL_CONSTANTS.OPACITY_PER_SLOT, 0, 1);
  const blur = clamp(Math.pow(distance, 1.28) * STORY_WHEEL_CONSTANTS.BLUR_PER_SLOT, 0, 7);
  const zIndex = 400 - Math.round(distance * 100);

  return {
    isVisible,
    isCenter,
    relativeSlot,
    slotName,
    style: {
      "--panel-angle": `${relativeSlot * STORY_WHEEL_CONSTANTS.STEP_ANGLE_DEG}deg`,
      "--panel-scale": scale.toFixed(3),
      "--panel-opacity": opacity.toFixed(3),
      "--panel-blur": `${blur.toFixed(2)}px`,
      zIndex,
    } as CSSProperties,
  };
}
