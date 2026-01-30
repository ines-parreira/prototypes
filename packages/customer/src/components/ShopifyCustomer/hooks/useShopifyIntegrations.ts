import { useListIntegrations } from '@gorgias/helpdesk-queries'

export function useShopifyIntegrations() {
    const { data, isLoading, isError, error, refetch } = useListIntegrations(
        {
            type: 'shopify',
        },
        {
            query: {
                refetchOnWindowFocus: false,
            },
        },
    )

    return {
        integrations: data?.data.data ?? [],
        isLoading,
        isError,
        error,
        refetch,
    }
}
