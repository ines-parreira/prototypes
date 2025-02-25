import { useMemo } from 'react'

import _groupBy from 'lodash/groupBy'

import { ActionTemplate } from '../types'
import useGetIsActionStepEnabled from './useGetIsActionStepEnabled'

const useEnabledActionStepsByApp = (steps: ActionTemplate[]) => {
    const getIsActionStepEnabled = useGetIsActionStepEnabled()

    return useMemo(
        () =>
            _groupBy(
                steps.filter((step) =>
                    getIsActionStepEnabled(step.internal_id),
                ),
                (step) => {
                    switch (step.apps[0].type) {
                        case 'shopify':
                        case 'recharge':
                            return step.apps[0].type
                        case 'app':
                            return step.apps[0].app_id
                    }
                },
            ),
        [steps, getIsActionStepEnabled],
    )
}

export default useEnabledActionStepsByApp
