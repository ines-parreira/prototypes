import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { getTicketState } from 'state/ticket/selectors'

type IntegrationCustomer = {
    id: number
    created_at?: string
}

type IntegrationData = {
    [key: string]: unknown
    customer?: IntegrationCustomer
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

    const customers = ticketCustomerShopifyIntegrations
        .map(([, integrationData]) => integrationData.customer)
        .filter(Boolean) as IntegrationCustomer[]

    const orders = ticketCustomerShopifyIntegrations.reduce<
        Array<{
            id: number
            order_number: number
            created_at?: string
            updated_at?: string
        }>
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
        customers,
        ticketId: ticket?.id as number | undefined,
        orders,
        shopifyIntegrations: customerShopifyIntegrations,
    }
}
