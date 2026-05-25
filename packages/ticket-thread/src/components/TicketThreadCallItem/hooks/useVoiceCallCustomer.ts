import { useGetCustomer } from '@repo/customer/hooks'

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
