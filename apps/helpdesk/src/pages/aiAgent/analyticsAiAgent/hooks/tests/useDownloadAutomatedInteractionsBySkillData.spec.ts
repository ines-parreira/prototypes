import { renderHook } from '@testing-library/react'

import { useAutomatedInteractionsBySkill } from 'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadAutomatedInteractionsBySkillData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAutomatedInteractionsBySkillData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/automate/useAutomatedInteractionsBySkill')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseAutomatedInteractionsBySkill = jest.mocked(
    useAutomatedInteractionsBySkill,
)

describe('useDownloadAutomatedInteractionsBySkillData', () => {
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
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: [{ name: 'Order Tracking', value: 500 }],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is undefined', () => {
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV with skill data', () => {
        const mockSkillData = [
            { name: 'Order Tracking', value: 500 },
            { name: 'Return Processing', value: 300 },
            { name: 'Product Recommendations', value: 200 },
        ]

        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: mockSkillData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('automated-interactions-by-skill'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Skill')
        expect(csvContent).toContain('Automated interactions')
        expect(csvContent).toContain('Order Tracking')
        expect(csvContent).toContain('Return Processing')
        expect(csvContent).toContain('Product Recommendations')
    })

    it('should include fileName in return value', () => {
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: [{ name: 'Order Tracking', value: 500 }],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomatedInteractionsBySkillData(),
        )

        expect(result.current.fileName).toContain(
            'automated-interactions-by-skill',
        )
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useAutomatedInteractionsBySkill with correct params', () => {
        mockedUseAutomatedInteractionsBySkill.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadAutomatedInteractionsBySkillData())

        expect(mockedUseAutomatedInteractionsBySkill).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
        )
    })
})
