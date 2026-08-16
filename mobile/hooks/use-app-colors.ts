import { useColorScheme } from 'react-native'

import { AppColors, AppColorsDark } from '../constants/theme'
import type { AppColorsShape } from '../constants/theme'

export function useAppColors(): AppColorsShape {
  const scheme = useColorScheme()
  return scheme === 'dark' ? AppColorsDark : AppColors
}
