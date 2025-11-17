import { useCallback } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

import type { ActionTemplate } from '../types'

const useGetIsActionStepEnabled = () => {
    const enabledSteps = useFlag(FeatureFlagKey.ActionSteps)

    return useCallback(
        (internalId: ActionTemplate['internal_id']) => {
            return !(
                Array.isArray(enabledSteps) &&
                !enabledSteps.includes(internalId)
            )
        },
        [enabledSteps],
    )
}

export default useGetIsActionStepEnabled
