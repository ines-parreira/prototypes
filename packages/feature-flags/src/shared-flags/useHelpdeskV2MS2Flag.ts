import { useIsMobileResolution } from '@repo/hooks'

import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2MS2Flag(): boolean {
    const isMobileResolution = useIsMobileResolution()

    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    return hasUIVisionBeta && !isMobileResolution
}
