import type { TicketCustomer } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

type CustomerIntegrationData = {
    __integration_type__?: string
    customer?: {
        id?: number
    }
}

export function getShopifyCustomerAssociations(
    customer: TicketCustomer | null,
) {
    const integrations = (customer?.integrations ?? {}) as Record<
        string,
        CustomerIntegrationData
    >
    const associatedShopifyCustomerIds = new Set<number>()
    const externalIdMap = new Map<number, string>()

    Object.entries(integrations).forEach(([id, integration]) => {
        if (integration.__integration_type__ !== IntegrationType.Shopify) {
            return
        }

        const integrationId = Number(id)

        if (Number.isNaN(integrationId)) {
            return
        }

        associatedShopifyCustomerIds.add(integrationId)

        if (integration.customer?.id) {
            externalIdMap.set(integrationId, String(integration.customer.id))
        }
    })

    return {
        associatedShopifyCustomerIds,
        externalIdMap,
    }
}
