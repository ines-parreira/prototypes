import { Duration } from '@gorgias/toolkit'

import { useGetCustomer } from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

export function useSourceCustomer(sourceCustomer: Customer | null) {
    const { data: fullSourceData, isLoading } = useGetCustomer(
        sourceCustomer?.id || 0,
        undefined,
        {
            query: {
                enabled: !!sourceCustomer?.id,
                staleTime: Duration.hours(1),
            },
        },
    )

    return {
        sourceCustomer: fullSourceData?.data || sourceCustomer,
        isLoading,
    }
}
