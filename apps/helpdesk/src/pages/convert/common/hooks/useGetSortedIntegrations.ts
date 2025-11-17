import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { compare } from 'utils'

export function useGetSortedIntegrations() {
    const getGorgiasChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )
    const integrations = useAppSelector(getGorgiasChatIntegrations)
    return useMemo(
        () => [...integrations].sort((a, b) => compare(a.name, b.name)),
        [integrations],
    )
}
