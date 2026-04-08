import {
  DESIGN_SYSTEM,
  createCardSurfaceStyle,
  createChipContainerStyle,
  createScreenContentStyle,
} from './DesignSystem';

describe('DesignSystem', () => {
  it('builds default screen content style', () => {
    expect(createScreenContentStyle()).toEqual({
      paddingTop: DESIGN_SYSTEM.screen.paddingTop,
      paddingLeft: DESIGN_SYSTEM.screen.paddingHorizontal,
      paddingRight: DESIGN_SYSTEM.screen.paddingHorizontal,
      paddingBottom: DESIGN_SYSTEM.screen.paddingBottom,
      gap: DESIGN_SYSTEM.screen.gap,
    });
  });

  it('applies screen content overrides', () => {
    expect(createScreenContentStyle({ paddingHorizontal: 12, gap: 8 })).toMatchObject({
      paddingLeft: 12,
      paddingRight: 12,
      gap: 8,
      paddingTop: DESIGN_SYSTEM.screen.paddingTop,
      paddingBottom: DESIGN_SYSTEM.screen.paddingBottom,
    });
  });

  it('builds default card surface style', () => {
    expect(createCardSurfaceStyle()).toEqual({
      borderRadius: DESIGN_SYSTEM.card.radius,
      padding: DESIGN_SYSTEM.card.padding,
      borderWidth: DESIGN_SYSTEM.card.borderWidth,
    });
  });

  it('builds compact and default chip styles', () => {
    expect(createChipContainerStyle(false)).toEqual({
      borderRadius: DESIGN_SYSTEM.chip.radius,
      paddingHorizontal: DESIGN_SYSTEM.chip.defaultPaddingHorizontal,
      paddingVertical: DESIGN_SYSTEM.chip.defaultPaddingVertical,
    });

    expect(createChipContainerStyle(true)).toEqual({
      borderRadius: DESIGN_SYSTEM.chip.radius,
      paddingHorizontal: DESIGN_SYSTEM.chip.compactPaddingHorizontal,
      paddingVertical: DESIGN_SYSTEM.chip.compactPaddingVertical,
    });
  });
});
