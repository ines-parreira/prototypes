import {
    getListAnalyticsCustomReportsQueryOptions,
    useCreateAnalyticsCustomReport,
} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {DashboardInput} from 'pages/stats/custom-reports/types'
import {createDashboardPayload} from 'pages/stats/custom-reports/utils'

export const createDashboardMutationConfig = (queryClient: QueryClient) => ({
    onSuccess() {
        const {queryKey: customReportsQueryKey} =
            getListAnalyticsCustomReportsQueryOptions()

        void queryClient.invalidateQueries(customReportsQueryKey)
    },
})

export const useCreateCustomReport = () => {
    const queryClient = useQueryClient()

    const {mutateAsync, isLoading, isError} = useCreateAnalyticsCustomReport({
        mutation: createDashboardMutationConfig(queryClient),
    })

    const createCustomReport = useCallback(
        (data: DashboardInput) => {
            return mutateAsync({data: createDashboardPayload(data)})
        },
        [mutateAsync]
    )

    return {
        isLoading,
        isError,
        createCustomReport,
    }
}
