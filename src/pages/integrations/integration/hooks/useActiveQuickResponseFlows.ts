import {useMemo} from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

export function useActiveQuickResponseFlows(
    configuration?: SelfServiceConfiguration
) {
    const quickResponses = useMemo(() => {
        if (configuration) {
            return configuration.quick_response_policies.filter(
                (response) => response.deactivated_datetime === null
            )
        }
        return []
    }, [configuration])

    return quickResponses
}
