import { IntegrationType } from '@gorgias/helpdesk-types'

type Integration<TOrder> = {
    __integration_type__: string
    orders?: TOrder[]
}

export type OrderWithIntegration<TOrder> = {
    order: TOrder
    integrationId: number
}

export function extractOrdersWithIntegration<TOrder>(integrations: {
    [key: string]: Integration<TOrder>
}): OrderWithIntegration<TOrder>[] {
    return Object.entries(integrations ?? {})
        .filter(
            ([, integration]) =>
                integration?.__integration_type__ === IntegrationType.Shopify,
        )
        .flatMap(([id, integration]) =>
            (integration.orders ?? []).map((order) => ({
                order,
                integrationId: Number(id),
            })),
        )
}
