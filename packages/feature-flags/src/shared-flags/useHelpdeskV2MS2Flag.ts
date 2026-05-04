import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2MS2Flag(): boolean {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    return hasUIVisionBeta
}
