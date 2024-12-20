import {useFlags} from 'launchdarkly-react-client-sdk'
import _groupBy from 'lodash/groupBy'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import {ActionTemplate} from '../types'

const useEnabledActionStepsByApp = (steps: ActionTemplate[]) => {
    const enabledSteps:
        | ActionTemplate['internal_id'][]
        | Record<never, never>
        | undefined = useFlags()[FeatureFlagKey.ActionSteps]

    return useMemo(
        () =>
            _groupBy(
                steps.filter((step) => {
                    return !(
                        Array.isArray(enabledSteps) &&
                        !enabledSteps.includes(step.internal_id)
                    )
                }),
                (step) => {
                    switch (step.apps[0].type) {
                        case 'shopify':
                        case 'recharge':
                            return step.apps[0].type
                        case 'app':
                            return step.apps[0].app_id
                    }
                }
            ),
        [steps, enabledSteps]
    )
}

export default useEnabledActionStepsByApp
