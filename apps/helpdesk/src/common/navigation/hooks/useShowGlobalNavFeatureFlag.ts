import { useIsMobileResolution } from '@gorgias/toolkit-react'

export function useDesktopOnlyShowGlobalNavFeatureFlag() {
    const isMobileResolution = useIsMobileResolution()

    return !isMobileResolution
}
