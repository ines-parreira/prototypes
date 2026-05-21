import { useGetCustomer } from '@gorgias/helpdesk-queries'

import { customerGetQueryOptions } from '../../../hooks/shared/customerQueryOptions'

export function useVoiceCallCustomer(customerId: number) {
    const { data, isLoading } = useGetCustomer(customerId, undefined, {
        query: {
            ...customerGetQueryOptions,
            retry: false,
        },
    })

    return {
        customer: data?.data,
        isLoading,
    }
}
