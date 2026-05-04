import { useMemo } from 'react'

import type { TicketCustomer } from '@gorgias/helpdesk-queries'
import { useGetCustomer } from '@gorgias/helpdesk-queries'

import { getShopifyCustomerAssociations } from './getShopifyCustomerAssociations'

export function useNewTicketPageShopifyCustomerData(
    customer: TicketCustomer | null,
) {
    const { data: fullCustomerResponse } = useGetCustomer(
        customer?.id ?? 0,
        undefined,
        {
            query: {
                enabled: !!customer?.id,
            },
        },
    )
    const shopifyCustomerSource =
        (fullCustomerResponse?.data as TicketCustomer | undefined) ?? customer

    return useMemo(
        () => getShopifyCustomerAssociations(shopifyCustomerSource),
        [shopifyCustomerSource],
    )
}
