import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

export function useDesktopOnlyShowGlobalNavFeatureFlag() {
    const isMobileResolution = useIsMobileResolution()

    return !isMobileResolution
}
