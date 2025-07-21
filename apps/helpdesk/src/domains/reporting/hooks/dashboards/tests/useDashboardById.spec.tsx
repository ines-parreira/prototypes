import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockGetAnalyticsCustomReportHandler } from '@gorgias/helpdesk-mocks'

import { useDashboardById } from 'domains/reporting/hooks/dashboards/useDashboardById'
import { dashboardFromApi } from 'domains/reporting/pages/dashboards/utils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const server = setupServer()
const queryClient = mockQueryClient()

const renderHookWithQueryClient = () =>
    renderHook(() => useDashboardById(1), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })

describe('useDashboardById', () => {
    beforeAll(() => server.listen())
    afterEach(() => {
        server.resetHandlers()
        queryClient.removeQueries()
    })
    afterAll(() => server.close())

    it('returns dashboard if the request is ok', async () => {
        const getAnalyticsCustomReportHandler =
            mockGetAnalyticsCustomReportHandler()
        server.use(getAnalyticsCustomReportHandler.handler)

        const { result } = renderHookWithQueryClient()

        await waitFor(() => {
            expect(result.current?.data).toEqual(
                dashboardFromApi(getAnalyticsCustomReportHandler.data),
            )
        })
    })
})
