import { useGetCustomer } from '@gorgias/helpdesk-queries'

export function useVoiceCallCustomer(customerId: number) {
    const { data, isLoading } = useGetCustomer(customerId, undefined, {
        query: {
            retry: false,
            staleTime: 30 * 60 * 1000,
        },
    })

    return {
        customer: data?.data,
        isLoading,
    }
}
