import { useMemo } from 'react'

import { TicketInfobarTab } from '@repo/navigation'

import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import type { Integration } from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getIntegrationsData } from 'state/ticket/selectors'

export type CustomerFilteredIntegrations = Map<TicketInfobarTab, Integration[]>

export function useCustomerFilteredIntegrations(): CustomerFilteredIntegrations {
    const customerIntegrations = useAppSelector(getIntegrationsData)
    const rechargeIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Recharge),
    )
    const bigcommerceIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Bigcommerce),
    )
    const magento2Integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Magento2),
    )
    const smileIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Smile),
    )
    const yotpoIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Yotpo),
    )

    return useMemo(() => {
        const integrationsByTab: ReadonlyArray<
            readonly [TicketInfobarTab, Integration[]]
        > = [
            [TicketInfobarTab.Recharge, rechargeIntegrations],
            [TicketInfobarTab.BigCommerce, bigcommerceIntegrations],
            [TicketInfobarTab.Magento, magento2Integrations],
            [TicketInfobarTab.Smile, smileIntegrations],
            [TicketInfobarTab.Yotpo, yotpoIntegrations],
        ]

        const result: CustomerFilteredIntegrations = new Map()
        for (const [tab, integrations] of integrationsByTab) {
            const matched: Integration[] = []
            customerIntegrations.forEach(
                (_: unknown, integrationId: string) => {
                    const match = integrations.find(
                        (integration) =>
                            String(integration.id) === integrationId,
                    )
                    if (match) matched.push(match)
                },
            )
            result.set(tab, matched)
        }
        return result
    }, [
        customerIntegrations,
        rechargeIntegrations,
        bigcommerceIntegrations,
        magento2Integrations,
        smileIntegrations,
        yotpoIntegrations,
    ])
}
