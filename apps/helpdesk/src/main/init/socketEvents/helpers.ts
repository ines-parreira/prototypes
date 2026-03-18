import { memoize, throttle } from 'lodash'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'

type CustomFieldsCacheParams = {
    customerId?: number
    ticketId?: number
}

export function throttledUpdateCustomFieldsCache(
    params: CustomFieldsCacheParams,
) {
    getThrottledUpdateForCustomFields(params)()
}

// Temporary invalidation workaround until Ably events are migrated
// and we are able to update these query caches directly from the event payload.
// inspired by throttledUpdateCustomerCache
// in apps/helpdesk/src/pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers.ts
export const getThrottledUpdateForCustomFields = memoize(
    ({ customerId, ticketId }: CustomFieldsCacheParams) =>
        throttle(
            () => {
                if (ticketId) {
                    void appQueryClient.invalidateQueries({
                        queryKey:
                            queryKeys.tickets.listTicketCustomFields(ticketId),
                    })
                }

                if (customerId) {
                    void appQueryClient.invalidateQueries({
                        queryKey:
                            queryKeys.customers.listCustomerCustomFieldsValues(
                                customerId,
                            ),
                    })
                }
            },
            5_000,
            { leading: true },
        ),
    ({ customerId, ticketId }: CustomFieldsCacheParams) =>
        `${ticketId ?? 'no-ticket'}-${customerId ?? 'no-customer'}`,
)
