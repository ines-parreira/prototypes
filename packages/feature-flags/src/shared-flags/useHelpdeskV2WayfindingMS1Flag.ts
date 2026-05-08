import { useIsMobileResolution } from '@repo/hooks'

import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2WayfindingMS1Flag(): boolean {
    const isMobileResolution = useIsMobileResolution()

    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    return hasUIVisionBeta && !isMobileResolution
}
