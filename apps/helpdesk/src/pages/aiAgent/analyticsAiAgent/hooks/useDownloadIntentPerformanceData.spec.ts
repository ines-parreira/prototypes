import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useIntentPerformanceMetrics } from './useIntentPerformanceMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useIntentPerformanceMetrics')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseIntentPerformanceMetrics = jest.mocked(
    useIntentPerformanceMetrics,
)

describe('useDownloadIntentPerformanceData', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('should return isLoading as true when data is loading', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 50,
                    successRate: 0.85,
                    costSaved: 5000,
                },
            ],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is undefined', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV with intent performance data', () => {
        const mockIntentData = [
            {
                intentL1: 'Order',
                intentL2: 'Status',
                handoverInteractions: 100,
                snoozedInteractions: 50,
                successRate: 0.85,
                costSaved: 5000,
            },
            {
                intentL1: 'Return',
                intentL2: 'Request',
                handoverInteractions: 75,
                snoozedInteractions: 25,
                successRate: 0.9,
                costSaved: 3750,
            },
        ]

        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('intent-performance-breakdown'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Intent L1')
        expect(csvContent).toContain('Intent L2')
        expect(csvContent).toContain('Handover interactions')
        expect(csvContent).toContain('Snoozed interactions')
        expect(csvContent).toContain('Success rate')
        expect(csvContent).toContain('Cost saved')
    })

    it('should sort data by intentL1 in descending order', () => {
        const mockIntentData = [
            {
                intentL1: 'Account',
                intentL2: 'Settings',
                handoverInteractions: 50,
                snoozedInteractions: 20,
                successRate: 0.8,
                costSaved: 2500,
            },
            {
                intentL1: 'Return',
                intentL2: 'Request',
                handoverInteractions: 75,
                snoozedInteractions: 25,
                successRate: 0.9,
                costSaved: 3750,
            },
            {
                intentL1: 'Order',
                intentL2: 'Status',
                handoverInteractions: 100,
                snoozedInteractions: 50,
                successRate: 0.85,
                costSaved: 5000,
            },
        ]

        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        const csvContent = Object.values(result.current.files)[0]
        const returnIndex = csvContent.indexOf('Return')
        const orderIndex = csvContent.indexOf('Order')
        const accountIndex = csvContent.indexOf('Account')

        expect(returnIndex).toBeLessThan(orderIndex)
        expect(orderIndex).toBeLessThan(accountIndex)
    })

    it('should include fileName in return value', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 50,
                    successRate: 0.85,
                    costSaved: 5000,
                },
            ],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDownloadIntentPerformanceData())

        expect(result.current.fileName).toContain(
            'intent-performance-breakdown',
        )
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useIntentPerformanceMetrics with correct params', () => {
        mockedUseIntentPerformanceMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadIntentPerformanceData())

        expect(mockedUseIntentPerformanceMetrics).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
        )
    })
})
