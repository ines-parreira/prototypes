import { useMemo } from 'react'

import type { IntegrationType } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getIntegrationsData } from 'state/ticket/selectors'

export default function useHasIntegration(type: IntegrationType) {
    const customerIntegrations = useAppSelector(getIntegrationsData)
    const integrations = useAppSelector(getIntegrationsByType(type))

    return useMemo(
        () =>
            integrations.some((integration) =>
                customerIntegrations.has(String(integration.id)),
            ),
        [integrations, customerIntegrations],
    )
}
