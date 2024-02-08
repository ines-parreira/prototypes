import {useMemo} from 'react'

import useWindowSize from '../useWindowSize'
import useDebouncedValue from '../useDebouncedValue'

import {MOBILE_BREAKPOINT, UPDATE_DEBOUNCE_TIME} from './constants'

export default function useIsMobileResolution() {
    const {width} = useWindowSize()
    const debouncedWidth = useDebouncedValue(width, UPDATE_DEBOUNCE_TIME)

    return useMemo(() => debouncedWidth <= MOBILE_BREAKPOINT, [debouncedWidth])
}
