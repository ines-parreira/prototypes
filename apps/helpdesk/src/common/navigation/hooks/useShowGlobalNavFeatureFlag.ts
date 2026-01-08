import { useIsMobileResolution } from '@repo/hooks'

export function useDesktopOnlyShowGlobalNavFeatureFlag() {
    const isMobileResolution = useIsMobileResolution()

    return !isMobileResolution
}
