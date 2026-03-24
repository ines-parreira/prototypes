import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/ecommerce-storage-queries'

export function useCustomerUpdatedInvalidation(customerId: number | undefined) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!customerId) return

        function handleCustomerUpdated(event: Event) {
            const detail = (event as CustomEvent<{ customerId: number }>).detail
            if (detail.customerId !== customerId) {
                return
            }
            queryClient.invalidateQueries({
                queryKey: queryKeys.ecommerceData.all(),
            })
        }

        window.addEventListener('customer-updated', handleCustomerUpdated)
        return () =>
            window.removeEventListener(
                'customer-updated',
                handleCustomerUpdated,
            )
    }, [customerId, queryClient])
}
