import {useMemo} from 'react'

import {getIntegrationsByType} from 'state/integrations/selectors'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {compare} from 'utils'

export function useGetSortedIntegrations() {
    const getGorgiasChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat
            ),
        []
    )
    const integrations = useAppSelector(getGorgiasChatIntegrations)
    return useMemo(
        () => [...integrations].sort((a, b) => compare(a.name, b.name)),
        [integrations]
    )
}
