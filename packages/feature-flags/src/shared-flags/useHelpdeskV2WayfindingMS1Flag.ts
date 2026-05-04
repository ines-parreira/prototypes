import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2WayfindingMS1Flag(): boolean {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    return hasUIVisionBeta
}
