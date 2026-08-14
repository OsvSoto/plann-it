/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

export const AppColors = {
  brand: '#6F45A5',
  brandDark: '#4F2D7F',
  brandSoft: '#E9E1F3',
  accent: '#FF6B2C',
  accentPressed: '#E8521D',
  accentSoft: '#FFF0E8',
  background: '#F8F5FB',
  surface: '#FFFFFF',
  text: '#342247',
  textMuted: '#766682',
  border: '#D9CEE8',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
} as const

const tintColorLight = AppColors.brand
const tintColorDark = '#FFFFFF'

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
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
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
