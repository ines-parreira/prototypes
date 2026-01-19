import { useQuery } from '@tanstack/react-query'

import type { Customer } from '@gorgias/helpdesk-types'

import { getSimilarCustomer } from '../api/getSimilarCustomer'

export const similarCustomerQueryKeys = {
    all: ['customers', 'similar'] as const,
    detail: (customerId?: number) =>
        ['customers', 'similar', customerId] as const,
}

const STALE_TIME = 5 * 60 * 1000
const CACHE_TIME = 5 * 60 * 1000

/**
 * temporary hook until we get OpenAPI spec to include this
 * so that it is available through rest-api-sdk packages
 * https://linear.app/gorgias/issue/SUPXP-5013/customer-similar-resource-not-available-in-openapi-spec
 */
export function useGetSimilarCustomer(customerId?: number) {
    return useQuery<Customer | null>({
        queryKey: similarCustomerQueryKeys.detail(customerId),
        queryFn: async ({ signal }: { signal?: AbortSignal }) => {
            if (!customerId) {
                return null
            }
            return getSimilarCustomer({ customerId }, signal)
        },
        enabled: !!customerId,
        staleTime: STALE_TIME,
        cacheTime: CACHE_TIME,
    })
}
