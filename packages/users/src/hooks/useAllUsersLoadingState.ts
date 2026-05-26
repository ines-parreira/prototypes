import { useIsFetching, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { USERS_PAGE_LIMIT } from './useAllUsers'

export function useAllUsersLoadingState() {
    const queryKey = queryKeys.users.listAllUsers({ limit: USERS_PAGE_LIMIT })
    const isFetching = useIsFetching({ queryKey }) > 0
    const queryClient = useQueryClient()
    const state = queryClient.getQueryState(queryKey)

    return {
        isLoading: isFetching && !state?.data,
        isError: state?.status === 'error',
    }
}
