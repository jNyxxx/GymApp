import type { TextStyle, ViewStyle } from 'react-native';

export const DESIGN_SYSTEM = {
  screen: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 96,
    gap: 16,
  },
  card: {
    radius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  sheet: {
    topRadius: 24,
    horizontalPadding: 24,
    actionGap: 12,
  },
  heading: {
    screenTitleSize: 28,
    sectionLabelSize: 11,
    sectionLetterSpacing: 1.5,
  },
  chip: {
    radius: 999,
    compactPaddingHorizontal: 10,
    compactPaddingVertical: 4,
    defaultPaddingHorizontal: 12,
    defaultPaddingVertical: 6,
  },
} as const;

interface ScreenContentStyleOptions {
  paddingTop?: number;
  paddingHorizontal?: number;
  paddingBottom?: number;
  gap?: number;
}

interface CardSurfaceStyleOptions {
  radius?: number;
  padding?: number;
  borderWidth?: number;
}

export function createScreenContentStyle(options: ScreenContentStyleOptions = {}): ViewStyle {
  return {
    paddingTop: options.paddingTop ?? DESIGN_SYSTEM.screen.paddingTop,
    paddingLeft: options.paddingHorizontal ?? DESIGN_SYSTEM.screen.paddingHorizontal,
    paddingRight: options.paddingHorizontal ?? DESIGN_SYSTEM.screen.paddingHorizontal,
    paddingBottom: options.paddingBottom ?? DESIGN_SYSTEM.screen.paddingBottom,
    gap: options.gap ?? DESIGN_SYSTEM.screen.gap,
  };
}

export function createCardSurfaceStyle(options: CardSurfaceStyleOptions = {}): ViewStyle {
  return {
    borderRadius: options.radius ?? DESIGN_SYSTEM.card.radius,
    padding: options.padding ?? DESIGN_SYSTEM.card.padding,
    borderWidth: options.borderWidth ?? DESIGN_SYSTEM.card.borderWidth,
  };
}

export function createChipContainerStyle(compact = false): ViewStyle {
  return {
    borderRadius: DESIGN_SYSTEM.chip.radius,
    paddingHorizontal: compact
      ? DESIGN_SYSTEM.chip.compactPaddingHorizontal
      : DESIGN_SYSTEM.chip.defaultPaddingHorizontal,
    paddingVertical: compact
      ? DESIGN_SYSTEM.chip.compactPaddingVertical
      : DESIGN_SYSTEM.chip.defaultPaddingVertical,
  };
}

export const screenContentStyle = createScreenContentStyle();
export const cardSurfaceStyle = createCardSurfaceStyle();

export const sectionHeadingTextStyle: TextStyle = {
  fontSize: DESIGN_SYSTEM.heading.sectionLabelSize,
  textTransform: 'uppercase',
  letterSpacing: DESIGN_SYSTEM.heading.sectionLetterSpacing,
  fontWeight: '700',
};

export const screenTitleTextStyle: TextStyle = {
  fontSize: DESIGN_SYSTEM.heading.screenTitleSize,
  fontWeight: '800',
  lineHeight: 34,
};

export const sheetActionRowStyle: ViewStyle = {
  flexDirection: 'row',
  gap: DESIGN_SYSTEM.sheet.actionGap,
};

export const chipTextStyle: TextStyle = {
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.3,
};
