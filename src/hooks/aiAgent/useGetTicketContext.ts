import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { getTicketState } from 'state/ticket/selectors'

type Customer = {
    id: number
}

type IntegrationData = {
    [key: string]: unknown
    customer?: Customer
    __integration_type__: IntegrationType
}

export const useGetTicketContext = () => {
    const accountId = useAppSelector(getCurrentAccountId)
    const ticket = useAppSelector(getTicketState).toJS()
    const shopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const ticketCustomerShopifyIntegrations = Object.entries<IntegrationData>(
        ticket?.customer?.integrations ?? {},
    ).filter(
        ([, { __integration_type__ }]) =>
            __integration_type__ === IntegrationType.Shopify,
    )

    const customerIds = ticketCustomerShopifyIntegrations.reduce(
        (ids, [, integrationData]) => {
            if (!integrationData?.customer) {
                return ids
            }

            ids.push(Number(integrationData.customer.id))

            return ids
        },
        [] as number[],
    )

    const orders = ticketCustomerShopifyIntegrations.reduce<
        Record<string, unknown>[]
    >((acc, [, integrationData]) => {
        if (!Array.isArray(integrationData?.orders)) {
            return acc
        }

        return acc.concat(integrationData.orders)
    }, [])

    const shopifyIntegrationIds = new Set(
        ticketCustomerShopifyIntegrations.map(([integrationId]) =>
            Number(integrationId),
        ),
    )

    const customerShopifyIntegrations = shopifyIntegrations.filter(
        (integration: ShopifyIntegration) =>
            shopifyIntegrationIds.has(integration.id),
    )

    return {
        accountId,
        customerIds,
        ticketId: ticket?.id as number | undefined,
        orders,
        shopifyIntegrations: customerShopifyIntegrations,
    }
}
