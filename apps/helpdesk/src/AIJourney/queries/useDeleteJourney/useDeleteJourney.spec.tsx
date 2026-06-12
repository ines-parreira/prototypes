import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockDeleteJourneyHandler } from '@gorgias/convert-mocks'

import { flowsListKeys } from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { workflowsConfigurationDefinitionKeys } from 'models/workflows/queries'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useDeleteJourney } from './useDeleteJourney'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockGetBaseUrl.mockReturnValue('http://mocked-base-url')
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useDeleteJourney', () => {
    it('should call deleteJourney with the provided id', async () => {
        const deleteJourneyMock = mockDeleteJourneyHandler()
        const waitForDeleteJourneyRequest =
            deleteJourneyMock.waitForRequest(server)
        server.use(deleteJourneyMock.handler)

        const { result } = renderHook(() => useDeleteJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({ id: 'journey-123' })
        })

        await waitForDeleteJourneyRequest((request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.pathname).toContain('journey-123')
        })
    })

    it('should invalidate related queries on successful deletion', async () => {
        server.use(mockDeleteJourneyHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useDeleteJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({ id: 'journey-123' })
        })

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiJourneyKeys.all(),
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: workflowsConfigurationDefinitionKeys.all(),
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: flowsListKeys.all(),
            })
        })
    })

    it('should surface errors when deletion fails', async () => {
        server.use(
            mockDeleteJourneyHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to delete journey' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useDeleteJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ id: 'journey-123' })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
    })
})
