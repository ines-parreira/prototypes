import { useMemo } from 'react'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getIntegrationsData } from 'state/ticket/selectors'

export default function useHasRecharge() {
    const customerIntegrations = useAppSelector(getIntegrationsData)
    const rechargeIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Recharge),
    )

    return useMemo(
        () =>
            rechargeIntegrations.some((integration) =>
                customerIntegrations.has(String(integration.id)),
            ),
        [rechargeIntegrations, customerIntegrations],
    )
}
