import { useMemo } from 'react'

import { useDebouncedValue } from '../useDebouncedValue'
import { useWindowSize } from '../useWindowSize'
import { MOBILE_BREAKPOINT, UPDATE_DEBOUNCE_TIME } from './constants'

export function useIsMobileResolution() {
    const { width } = useWindowSize()
    const debouncedWidth = useDebouncedValue(width, UPDATE_DEBOUNCE_TIME)

    return useMemo(() => debouncedWidth <= MOBILE_BREAKPOINT, [debouncedWidth])
}
