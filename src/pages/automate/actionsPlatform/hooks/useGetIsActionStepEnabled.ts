import {useFlags} from 'launchdarkly-react-client-sdk'
import {useCallback} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import {ActionTemplate} from '../types'

const useGetIsActionStepEnabled = () => {
    const enabledSteps:
        | ActionTemplate['internal_id'][]
        | Record<never, never>
        | undefined = useFlags()[FeatureFlagKey.ActionSteps]

    return useCallback(
        (internalId: ActionTemplate['internal_id']) => {
            return !(
                Array.isArray(enabledSteps) &&
                !enabledSteps.includes(internalId)
            )
        },
        [enabledSteps]
    )
}

export default useGetIsActionStepEnabled
