/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

export const AppColors = {
  brand: '#6F45A5',
  brandDark: '#4F2D7F',
  brandSoft: '#E9E1F3',
  accent: '#C15A93',
  accentPressed: '#9E4276',
  accentSoft: '#F5E2ED',
  accentStrong: '#A83D77',
  accentStrongSoft: '#EFCBE0',
  background: '#F8F5FB',
  surface: '#FFFFFF',
  text: '#342247',
  textMuted: '#766682',
  border: '#D9CEE8',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  notePending: '#E3A0C6',
  noteInProgress: '#DCCEF0',
  noteCompleted: '#FFD0C4',
  noteLineStrong: 'rgba(39, 48, 41, 0.42)',
  noteLineSoft: 'rgba(39, 48, 41, 0.28)',
  overlaySoft: 'rgba(255, 255, 255, 0.5)',
} as const

export type AppColorsShape = Record<keyof typeof AppColors, string>

export const AppColorsDark: AppColorsShape = {
  brand: '#B497DD',
  brandDark: '#8C68C4',
  brandSoft: '#2A2038',
  accent: '#E58AB8',
  accentPressed: '#F0A8CB',
  accentSoft: '#3A2430',
  accentStrong: '#E85FA0',
  accentStrongSoft: '#3D2130',
  background: '#17121F',
  surface: '#221A2E',
  text: '#F2EDF7',
  textMuted: '#B3A6C4',
  border: '#3A2E4A',
  danger: '#FF6B6B',
  dangerSoft: '#3A1F1F',
  notePending: '#5C3752',
  noteInProgress: '#3E3357',
  noteCompleted: '#5A3B30',
  noteLineStrong: 'rgba(0, 0, 0, 0.42)',
  noteLineSoft: 'rgba(0, 0, 0, 0.28)',
  overlaySoft: 'rgba(0, 0, 0, 0.35)',
}

const tintColorLight = AppColors.brand
const tintColorDark = AppColorsDark.brand

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColorLight,
    icon: AppColors.textMuted,
    tabIconDefault: AppColors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: AppColorsDark.text,
    background: AppColorsDark.background,
    tint: tintColorDark,
    icon: AppColorsDark.textMuted,
    tabIconDefault: AppColorsDark.textMuted,
    tabIconSelected: tintColorDark,
  },
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
