import { appQueryClient } from '@repo/api-resources'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { ThrottledCacheInvalidation } from 'utils/cacheInvalidationThrottle'
import { createCacheInvalidationThrottle } from 'utils/cacheInvalidationThrottle'

type CustomFieldsCacheParams = {
    customerId?: number
    ticketId?: number
}

export function throttledUpdateCustomFieldsCache(
    params: CustomFieldsCacheParams,
) {
    getThrottledUpdateForCustomFields(params)()
}

type GetThrottledUpdateForCustomFields = ((
    params: CustomFieldsCacheParams,
) => ThrottledCacheInvalidation) & {
    cache: { clear: () => void }
}

const throttledCustomFieldsUpdates = new Map<
    string,
    ThrottledCacheInvalidation
>()

const getCustomFieldsCacheKey = ({
    customerId,
    ticketId,
}: CustomFieldsCacheParams) =>
    `${ticketId ?? 'no-ticket'}-${customerId ?? 'no-customer'}`

// Temporary invalidation workaround until Ably events are migrated
// and we are able to update these query caches directly from the event payload.
// inspired by throttledUpdateCustomerCache
// in apps/helpdesk/src/pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers.ts
export const getThrottledUpdateForCustomFields = ((
    params: CustomFieldsCacheParams,
) => {
    const cacheKey = getCustomFieldsCacheKey(params)
    let throttledUpdate = throttledCustomFieldsUpdates.get(cacheKey)

    if (!throttledUpdate) {
        throttledUpdate = createCacheInvalidationThrottle(() => {
            if (params.ticketId) {
                void appQueryClient.invalidateQueries({
                    queryKey: queryKeys.tickets.listTicketCustomFields(
                        params.ticketId,
                    ),
                })
            }

            if (params.customerId) {
                void appQueryClient.invalidateQueries({
                    queryKey:
                        queryKeys.customers.listCustomerCustomFieldsValues(
                            params.customerId,
                        ),
                })
            }
        }, 5_000)
        throttledCustomFieldsUpdates.set(cacheKey, throttledUpdate)
    }

    return throttledUpdate
}) as GetThrottledUpdateForCustomFields

getThrottledUpdateForCustomFields.cache = {
    clear: () => throttledCustomFieldsUpdates.clear(),
}
