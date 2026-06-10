import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2MS4Dash6Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const isMobileResolution = useIsMobileResolution()

    return hasUIVisionBeta && !isMobileResolution
}
