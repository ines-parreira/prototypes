import { BillingState, useGetBillingState } from '@gorgias/helpdesk-queries'

const STALE_TIME = 1000 * 60 * 60 // 1h
const CACHE_TIME = 1000 * 60 * 65 // 1h5m

export function useBillingState(): BillingState | undefined {
    const { data } = useGetBillingState({
        query: {
            staleTime: STALE_TIME,
            cacheTime: CACHE_TIME,
            refetchOnWindowFocus: false,
        },
    })
    return data?.data
}
