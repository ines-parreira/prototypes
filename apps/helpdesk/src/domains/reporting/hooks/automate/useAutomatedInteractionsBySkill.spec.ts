import { renderHook, waitFor } from '@testing-library/react'

import {
    fetchAutomatedInteractionsBySkill,
    useAutomatedInteractionsBySkill,
} from 'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill'
import * as useMetricPerDimensionModule from 'domains/reporting/hooks/useMetricPerDimension'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

describe('useAutomatedInteractionsBySkill', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01',
            end_datetime: '2024-01-31',
        },
    }
    const mockTimezone = 'UTC'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return transformed data with skill labels', async () => {
        const mockData = {
            allValues: [
                {
                    dimension: AIAgentSkills.AIAgentSupport,
                    value: 100,
                },
                {
                    dimension: AIAgentSkills.AIAgentSales,
                    value: 50,
                },
            ],
        }

        jest.spyOn(
            useMetricPerDimensionModule,
            'useMetricPerDimensionV2',
        ).mockReturnValue({
            data: mockData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomatedInteractionsBySkill(mockFilters, mockTimezone),
        )

        await waitFor(() => {
            expect(result.current.data).toEqual([
                { name: 'Support Agent', value: 100 },
                { name: 'Shopping Assistant', value: 50 },
            ])
        })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle loading state', () => {
        jest.spyOn(
            useMetricPerDimensionModule,
            'useMetricPerDimensionV2',
        ).mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomatedInteractionsBySkill(mockFilters, mockTimezone),
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(false)
    })

    it('should handle error state', () => {
        jest.spyOn(
            useMetricPerDimensionModule,
            'useMetricPerDimensionV2',
        ).mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
        } as any)

        const { result } = renderHook(() =>
            useAutomatedInteractionsBySkill(mockFilters, mockTimezone),
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(true)
    })

    it('should handle null/undefined values', () => {
        const mockData = {
            allValues: [
                {
                    dimension: AIAgentSkills.AIAgentSupport,
                    value: null,
                },
                {
                    dimension: AIAgentSkills.AIAgentSales,
                    value: undefined,
                },
            ],
        }

        jest.spyOn(
            useMetricPerDimensionModule,
            'useMetricPerDimensionV2',
        ).mockReturnValue({
            data: mockData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomatedInteractionsBySkill(mockFilters, mockTimezone),
        )

        expect(result.current.data).toEqual([
            { name: 'Support Agent', value: 0 },
            { name: 'Shopping Assistant', value: 0 },
        ])
    })

    it('should handle unknown skill dimensions', () => {
        const mockData = {
            allValues: [
                {
                    dimension: 'UNKNOWN_SKILL',
                    value: 25,
                },
            ],
        }

        jest.spyOn(
            useMetricPerDimensionModule,
            'useMetricPerDimensionV2',
        ).mockReturnValue({
            data: mockData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomatedInteractionsBySkill(mockFilters, mockTimezone),
        )

        expect(result.current.data).toEqual([
            { name: 'UNKNOWN_SKILL', value: 25 },
        ])
    })
})

describe('fetchAutomatedInteractionsBySkill', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01',
            end_datetime: '2024-01-31',
        },
    }
    const mockTimezone = 'UTC'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch and return transformed data', async () => {
        const mockData = {
            allValues: [
                {
                    dimension: AIAgentSkills.AIAgentSupport,
                    value: 100,
                },
                {
                    dimension: AIAgentSkills.AIAgentSales,
                    value: 50,
                },
            ],
        }

        jest.spyOn(
            useMetricPerDimensionModule,
            'fetchMetricPerDimensionV2',
        ).mockResolvedValue({
            data: mockData,
            isError: false,
        } as any)

        const result = await fetchAutomatedInteractionsBySkill(
            mockFilters,
            mockTimezone,
        )

        expect(result.data).toEqual([
            { name: 'Support Agent', value: 100 },
            { name: 'Shopping Assistant', value: 50 },
        ])
        expect(result.isFetching).toBe(false)
        expect(result.isError).toBe(false)
    })

    it('should handle fetch errors', async () => {
        jest.spyOn(
            useMetricPerDimensionModule,
            'fetchMetricPerDimensionV2',
        ).mockResolvedValue({
            data: undefined,
            isError: true,
        } as any)

        const result = await fetchAutomatedInteractionsBySkill(
            mockFilters,
            mockTimezone,
        )

        expect(result.data).toEqual([])
        expect(result.isFetching).toBe(false)
        expect(result.isError).toBe(true)
    })
})
