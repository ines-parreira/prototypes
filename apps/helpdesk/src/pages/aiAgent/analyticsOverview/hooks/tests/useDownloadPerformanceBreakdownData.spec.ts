import { renderHook } from '@testing-library/react'

import { useDownloadPerformanceBreakdownData } from '../useDownloadPerformanceBreakdownData'
import type { FeatureMetrics } from '../usePerformanceMetricsPerFeature'

jest.mock('../usePerformanceMetricsPerFeature', () => ({
    usePerformanceMetricsPerFeature: jest.fn(),
}))

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(() => ({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        })),
    }),
)

const mockPerformanceMetrics = jest.requireMock(
    '../usePerformanceMetricsPerFeature',
)

const MOCK_DATA: FeatureMetrics[] = [
    {
        feature: 'AI Agent',
        automationRate: 0.18,
        automatedInteractions: 2700,
        handoverCount: 490,
        costSaved: 1200,
        timeSaved: 8700,
    },
    {
        feature: 'Flows',
        automationRate: 0.07,
        automatedInteractions: 900,
        handoverCount: 250,
        costSaved: 500,
        timeSaved: 4200,
    },
]

describe('useDownloadPerformanceBreakdownData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return CSV data with correct structure', () => {
        mockPerformanceMetrics.usePerformanceMetricsPerFeature.mockReturnValue({
            data: MOCK_DATA,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handovers: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.fileName).toContain('performance-breakdown')
        expect(result.current.fileName).toContain('.csv')

        const csvContent = result.current.files[result.current.fileName]
        expect(csvContent).toBeTruthy()

        const rows = csvContent.split('\r\n')
        expect(rows).toHaveLength(3)

        expect(rows[0]).toContain('Feature')
        expect(rows[0]).toContain('Overall automation rate')
        expect(rows[0]).toContain('Automated interactions')

        expect(rows[1]).toContain('AI Agent')
        expect(rows[2]).toContain('Flows')
    })

    it('should return empty CSV data when no data available', () => {
        mockPerformanceMetrics.usePerformanceMetricsPerFeature.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handovers: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        const csvContent = result.current.files[result.current.fileName]
        expect(csvContent).toBe('')
    })

    it('should format metric values correctly', () => {
        mockPerformanceMetrics.usePerformanceMetricsPerFeature.mockReturnValue({
            data: MOCK_DATA,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handovers: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        const csvContent = result.current.files[result.current.fileName]
        const rows = csvContent.split('\r\n')

        expect(rows[1]).toContain('AI Agent')
        expect(rows[1]).toContain('2,700')
        expect(rows[1]).toContain('$1,200')
        expect(rows[1]).toContain('490')
    })

    it('should handle loading state', () => {
        mockPerformanceMetrics.usePerformanceMetricsPerFeature.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            loadingStates: {
                automationRate: true,
                automatedInteractions: true,
                handovers: true,
                timeSaved: true,
            },
        })

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        expect(result.current.isLoading).toBe(true)
    })
})
