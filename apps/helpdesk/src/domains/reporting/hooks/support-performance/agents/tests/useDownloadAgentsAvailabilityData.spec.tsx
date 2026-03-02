import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    cleanStatsFilters,
    defaultState,
    mockAvailabilityAgents,
    period,
    userTimezone,
} from 'domains/reporting/hooks/support-performance/agents/tests/fixtures'
import {
    AGENTS_AVAILABILITY_REPORT_FILE_NAME,
    useDownloadAgentsAvailabilityData,
} from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsAvailabilityData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import { sortAgentAvailability } from 'domains/reporting/pages/support-performance/agents/sortAgentAvailability'
import { createAgentsAvailabilityReport } from 'domains/reporting/services/agentsAvailabilityReportingService'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData',
)
const useAgentAvailabilityDataMock = assumeMock(useAgentAvailabilityData)

jest.mock('domains/reporting/services/agentsAvailabilityReportingService')
const createAgentsAvailabilityReportMock = assumeMock(
    createAgentsAvailabilityReport,
)

jest.mock(
    'domains/reporting/pages/support-performance/agents/sortAgentAvailability',
)
const sortAgentAvailabilityMock = assumeMock(sortAgentAvailability)

describe('useDownloadAgentsAvailabilityData', () => {
    const renderHookWithStore = (storeState: RootState = defaultState) =>
        renderHook(() => useDownloadAgentsAvailabilityData(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(storeState)}>{children}</Provider>
            ),
        })

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters,
            userTimezone,
        } as unknown as ReturnType<typeof useStatsFilters>)
        useAgentAvailabilityDataMock.mockReturnValue({
            agents: mockAvailabilityAgents,
            customStatuses: [],
            isLoading: false,
            isError: false,
            isErrorCustomStatuses: false,
        })
        sortAgentAvailabilityMock.mockImplementation((agents) => agents)
    })

    it('should return report files, fileName and loading state', () => {
        const fileName = getCsvFileNameWithDates(
            period,
            AGENTS_AVAILABILITY_REPORT_FILE_NAME,
        )
        const mockReport = {
            files: { [fileName]: 'csv-data' },
        }

        createAgentsAvailabilityReportMock.mockReturnValue(mockReport)

        const { result } = renderHookWithStore()

        expect(createAgentsAvailabilityReportMock).toHaveBeenCalledWith(
            mockAvailabilityAgents,
            [],
            fileName,
        )
        expect(result.current).toEqual({
            files: mockReport.files,
            fileName,
            isLoading: false,
        })
    })

    it('should return loading state when data is loading', () => {
        useAgentAvailabilityDataMock.mockReturnValue({
            agents: mockAvailabilityAgents,
            customStatuses: [],
            isLoading: true,
            isError: false,
            isErrorCustomStatuses: false,
        })

        const { result } = renderHookWithStore()

        expect(createAgentsAvailabilityReportMock).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
    })

    it('should return empty files when no agents', () => {
        useAgentAvailabilityDataMock.mockReturnValue({
            agents: [],
            customStatuses: [],
            isLoading: false,
            isError: false,
            isErrorCustomStatuses: false,
        })

        const { result } = renderHookWithStore()

        expect(createAgentsAvailabilityReportMock).not.toHaveBeenCalled()
        expect(result.current.files).toEqual({})
    })

    it('should pass agents and sorting state to sortAgentAvailability and use the result', () => {
        const sortedAgents = [
            mockAvailabilityAgents[1],
            mockAvailabilityAgents[0],
        ]
        sortAgentAvailabilityMock.mockReturnValue(sortedAgents)

        const fileName = getCsvFileNameWithDates(
            period,
            AGENTS_AVAILABILITY_REPORT_FILE_NAME,
        )
        createAgentsAvailabilityReportMock.mockReturnValue({
            files: { [fileName]: 'csv-data' },
        })

        renderHookWithStore()

        expect(sortAgentAvailabilityMock).toHaveBeenCalledWith(
            mockAvailabilityAgents,
            expect.objectContaining({ field: expect.any(String) }),
        )
        expect(createAgentsAvailabilityReportMock).toHaveBeenCalledWith(
            sortedAgents,
            [],
            fileName,
        )
    })
})
