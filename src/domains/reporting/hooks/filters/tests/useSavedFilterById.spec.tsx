import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockListAnalyticsFiltersHandler } from '@gorgias/helpdesk-mocks'

import { useSavedFilterById } from 'domains/reporting/hooks/filters/useSavedFilterById'
import { fromApiFormatted } from 'domains/reporting/pages/common/filters/helpers'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const server = setupServer()
const queryClient = mockQueryClient()

const renderHookWithQueryClient = (filterId: number) =>
    renderHook(() => useSavedFilterById(filterId), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })

describe('useSavedFilterById', () => {
    beforeAll(() => server.listen())
    afterEach(() => {
        server.resetHandlers()
        queryClient.removeQueries()
    })
    afterAll(() => server.close())

    it('returns filter with a given id', async () => {
        const listAnalyticsFiltersHandler = mockListAnalyticsFiltersHandler()
        server.use(listAnalyticsFiltersHandler.handler)

        const firstFilter = listAnalyticsFiltersHandler.data.data[0]

        const { result } = renderHookWithQueryClient(firstFilter.id)

        await waitFor(() => {
            const expected = fromApiFormatted(firstFilter as any)

            expect(result.current.data).toEqual(expected)
        })
    })

    it('returns null if invalid filter id', async () => {
        const listAnalyticsFiltersHandler = mockListAnalyticsFiltersHandler()
        server.use(listAnalyticsFiltersHandler.handler)

        const { result } = renderHookWithQueryClient(-123)

        await waitFor(() => {
            expect(result.current.data).toBeNull()
        })
    })
})
