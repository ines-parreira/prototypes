import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

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
jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListCustomUserAvailabilityStatuses: jest.fn(),
}))

const useOnlineTimePerAgentAvailabilityMock = assumeMock(
    useOnlineTimePerAgentAvailability,
)
const useAvailabilityPerAgentPerStatusMock = assumeMock(
    useAvailabilityPerAgentPerStatus,
)
const useListCustomUserAvailabilityStatusesMock = assumeMock(
    useListCustomUserAvailabilityStatuses,
)

describe('useAgentAvailabilityData', () => {
    beforeEach(() => {
        useOnlineTimePerAgentAvailabilityMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockOnlineTimeData,
        } as any)

        useAvailabilityPerAgentPerStatusMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockPerStatusData,
        } as any)

        useListCustomUserAvailabilityStatusesMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockCustomStatuses,
        } as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return transformed agent data', () => {
        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        expect(result.current.agents).toHaveLength(3)
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

    it('should return custom statuses', () => {
        useListCustomUserAvailabilityStatusesMock.mockReturnValue({
            ...defaultHookReturn,
            data: mockCustomStatusWithData,
        } as any)

        const { result } = renderHook(() =>
            useAgentAvailabilityData(mockAgents, mockStatsFiltersRaw, 'UTC'),
        )

        expect(result.current.customStatuses).toHaveLength(1)
        expect(result.current.customStatuses[0].name).toBe('Lunch Break')
    })

    it('should handle empty data gracefully', () => {
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

        expect(result.current.agents).toHaveLength(3)
    })
})
