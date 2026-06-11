import { useIsFetching, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { INTEGRATIONS_PAGE_LIMIT } from './useAllIntegrations'

export function useAllIntegrationsLoadingState() {
    const queryKey = queryKeys.integrations.listAllIntegrations({
        limit: INTEGRATIONS_PAGE_LIMIT,
    })
    const isFetching = useIsFetching({ queryKey }) > 0
    const queryClient = useQueryClient()
    const state = queryClient.getQueryState(queryKey)

    return {
        isLoading: isFetching && !state?.data,
        isError: state?.status === 'error',
    }
}
