import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useAutomationRateByFeature } from '../useAutomationRateByFeature'
import { useDownloadAutomationRateByFeatureData } from '../useDownloadAutomationRateByFeatureData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('../useAutomationRateByFeature')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseAutomationRateByFeature = jest.mocked(useAutomationRateByFeature)

describe('useDownloadAutomationRateByFeatureData', () => {
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
        mockedUseAutomationRateByFeature.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseAutomationRateByFeature.mockReturnValue({
            data: [{ name: 'Support Agent', value: 85 }],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is undefined', () => {
        mockedUseAutomationRateByFeature.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseAutomationRateByFeature.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV with feature data', () => {
        const mockFeatureData = [
            { name: 'Support Agent', value: 85 },
            { name: 'Shopping Assistant', value: 90 },
            { name: 'FAQ Bot', value: 75 },
        ]

        mockedUseAutomationRateByFeature.mockReturnValue({
            data: mockFeatureData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('automation-rate-by-feature'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Feature')
        expect(csvContent).toContain('Automation rate (%)')
        expect(csvContent).toContain('Support Agent')
        expect(csvContent).toContain('Shopping Assistant')
        expect(csvContent).toContain('FAQ Bot')
    })

    it('should handle null values in feature data', () => {
        const mockFeatureData = [
            { name: 'Support Agent', value: 85 },
            { name: 'Shopping Assistant', value: null },
        ]

        mockedUseAutomationRateByFeature.mockReturnValue({
            data: mockFeatureData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Support Agent')
        expect(csvContent).toContain('N/A')
    })

    it('should handle undefined values in feature data', () => {
        const mockFeatureData = [
            { name: 'Support Agent', value: 85 },
            { name: 'Shopping Assistant', value: undefined },
        ]

        mockedUseAutomationRateByFeature.mockReturnValue({
            data: mockFeatureData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Support Agent')
        expect(csvContent).toContain('N/A')
    })

    it('should include fileName in return value', () => {
        mockedUseAutomationRateByFeature.mockReturnValue({
            data: [{ name: 'Support Agent', value: 85 }],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateByFeatureData(),
        )

        expect(result.current.fileName).toContain('automation-rate-by-feature')
        expect(result.current.fileName).toContain('.csv')
    })
})
