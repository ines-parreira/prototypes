import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomUserAvailabilityStatusesHandler,
    mockListCustomUserAvailabilityStatusesResponse,
} from '@gorgias/helpdesk-mocks'

import {
    useAvailabilityPerAgentPerStatus,
    useOnlineTimePerAgentAvailability,
} from 'domains/reporting/hooks/availability/useAvailabilityMetrics'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import {
    defaultHookReturn,
    mockAgents,
    mockCustomStatuses,
    mockCustomStatusWithData,
    mockOnlineTimeData,
    mockPerStatusData,
    mockStatsFiltersRaw,
} from 'domains/reporting/pages/support-performance/agents/tests/fixtures'

jest.mock('domains/reporting/hooks/availability/useAvailabilityMetrics')

const useOnlineTimePerAgentAvailabilityMock = assumeMock(
    useOnlineTimePerAgentAvailability,
)
const useAvailabilityPerAgentPerStatusMock = assumeMock(
    useAvailabilityPerAgentPerStatus,
)
const server = setupServer(
    mockListCustomUserAvailabilityStatusesHandler(async () =>
        HttpResponse.json(
            mockListCustomUserAvailabilityStatusesResponse(
                mockCustomStatuses.data,
            ),
        ),
    ).handler,
)

describe('useAgentAvailabilityData', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        useOnlineTimePerAgentAvailabilityMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockOnlineTimeData,
        } as any)

        useAvailabilityPerAgentPerStatusMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockPerStatusData,
        } as any)
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('should return transformed agent data', async () => {
        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        await waitFor(() => {
            expect(result.current.agents).toHaveLength(3)
        })
        expect(result.current.agents[0]).toMatchObject({
            id: 1,
            name: 'Alice Agent',
            email: 'alice@example.com',
        })
    })

    it('should return loading state', () => {
        useOnlineTimePerAgentAvailabilityMock.mockReturnValue({
            ...defaultHookReturn,
            isFetching: true,
            isLoading: true,
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.agents).toEqual([])
    })

    it('should return error state', () => {
        useOnlineTimePerAgentAvailabilityMock.mockReturnValue({
            ...defaultHookReturn,
            isError: true,
            error: new Error('API Error'),
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return custom statuses', async () => {
        server.use(
            mockListCustomUserAvailabilityStatusesHandler(async () =>
                HttpResponse.json(
                    mockListCustomUserAvailabilityStatusesResponse(
                        mockCustomStatusWithData.data,
                    ),
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        await waitFor(() => {
            expect(result.current.customStatuses).toHaveLength(1)
        })
        expect(result.current.customStatuses[0].name).toBe('Lunch Break')
    })

    it('should handle empty data gracefully', async () => {
        useOnlineTimePerAgentAvailabilityMock.mockReturnValue({
            ...defaultHookReturn,
            data: { allValues: [] },
        } as any)

        useAvailabilityPerAgentPerStatusMock.mockReturnValue({
            ...defaultHookReturn,
            data: { allData: [] },
        } as any)

        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        await waitFor(() => {
            expect(result.current.agents).toHaveLength(3)
        })
    })
})
