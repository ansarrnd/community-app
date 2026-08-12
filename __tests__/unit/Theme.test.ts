import { getAppTheme, darkThemeColors, lightThemeColors } from '../../constants/theme';

describe('Theme Resolution Unit Tests', () => {
  it('resolves dark theme when mode is dark regardless of system color scheme', () => {
    const theme1 = getAppTheme('light', 'dark');
    expect(theme1.isDark).toBe(true);
    expect(theme1.colors).toBe(darkThemeColors);

    const theme2 = getAppTheme('dark', 'dark');
    expect(theme2.isDark).toBe(true);
    expect(theme2.colors).toBe(darkThemeColors);
  });

  it('resolves light theme when mode is light regardless of system color scheme', () => {
    const theme1 = getAppTheme('dark', 'light');
    expect(theme1.isDark).toBe(false);
    expect(theme1.colors).toBe(lightThemeColors);

    const theme2 = getAppTheme('light', 'light');
    expect(theme2.isDark).toBe(false);
    expect(theme2.colors).toBe(lightThemeColors);
  });

  it('resolves theme based on system color scheme when mode is system', () => {
    const darkSystemTheme = getAppTheme('dark', 'system');
    expect(darkSystemTheme.isDark).toBe(true);
    expect(darkSystemTheme.colors).toBe(darkThemeColors);

    const lightSystemTheme = getAppTheme('light', 'system');
    expect(lightSystemTheme.isDark).toBe(false);
    expect(lightSystemTheme.colors).toBe(lightThemeColors);
  });

  it('returns appropriate aurora mesh coordinates for dark and light themes', () => {
    const darkTheme = getAppTheme('dark', 'dark');
    expect(darkTheme.auroraMesh.length).toBe(3);

    const lightTheme = getAppTheme('light', 'light');
    expect(lightTheme.auroraMesh.length).toBe(3);
    expect(lightTheme.auroraMesh[0].color).not.toEqual(darkTheme.auroraMesh[0].color);
  });

  it('defines segment pill tokens distinct from input tokens in both palettes', () => {
    expect(darkThemeColors.segmentBg).not.toBe(darkThemeColors.bgInput);
    expect(darkThemeColors.segmentBorder).not.toBe(darkThemeColors.borderInput);
    expect(darkThemeColors.segmentText).toBe(darkThemeColors.textPrimary);
    expect(darkThemeColors.segmentTextActive).toBe(darkThemeColors.accentTeal);

    expect(lightThemeColors.segmentBg).not.toBe(lightThemeColors.bgInput);
    expect(lightThemeColors.segmentBorder).not.toBe(lightThemeColors.borderInput);
    expect(lightThemeColors.segmentText).toBe(lightThemeColors.textPrimary);
    expect(lightThemeColors.segmentTextActive).toBe(lightThemeColors.accentTeal);
  });

  it('uses accent-tinted active segment backgrounds aligned with accentTeal', () => {
    expect(darkThemeColors.segmentBgActive).toContain('251');
    expect(lightThemeColors.segmentBgActive).toContain('200');
    expect(darkThemeColors.segmentBorderActive).toBe(darkThemeColors.accentTeal);
    expect(lightThemeColors.segmentBorderActive).toBe(lightThemeColors.accentTeal);
  });
});
