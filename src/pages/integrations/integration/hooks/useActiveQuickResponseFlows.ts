import {useMemo} from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

export function useActiveQuickResponseFlows(
    configuration?: SelfServiceConfiguration
) {
    const quickResponses = useMemo(() => {
        if (configuration) {
            return configuration.quickResponsePolicies.filter(
                (response) => response.deactivatedDatetime === null
            )
        }
        return []
    }, [configuration])

    return quickResponses
}
