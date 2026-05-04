import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'

export function useHelpdeskV2MS4Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const isMobileResolution = useIsMobileResolution()

    return hasUIVisionBeta && !isMobileResolution
}
