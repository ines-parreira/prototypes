import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAutomationCostSavedTrend,
    formatCostSavedData,
    useAutomationCostSavedTrend,
} from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)
const useMoneySavedPerInteractionWithAutomateMock = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)

describe('AutomationCostSavedTrend', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const userTimezone = 'UTC'
    const filteredAutomatedInteractions = { value: 2, prevValue: 4 }
    const trendResponse = {
        data: filteredAutomatedInteractions,
        isFetching: false,
        isError: false,
    }
    const moneySavedPerInteractionWithAutomate = 123

    describe('useAutomationCostSavedTrend', () => {
        beforeEach(() => {
            useFilteredAutomatedInteractionsMock.mockReturnValue(trendResponse)
            useMoneySavedPerInteractionWithAutomateMock.mockReturnValue(
                moneySavedPerInteractionWithAutomate,
            )
        })

        it('should calculate and format trend', () => {
            const { result } = renderHook(() =>
                useAutomationCostSavedTrend(statsFilters, userTimezone),
            )

            expect(result.current).toEqual({
                data: formatCostSavedData(
                    trendResponse,
                    moneySavedPerInteractionWithAutomate,
                ),
                isError: false,
                isFetching: false,
            })
        })

        it('should return 0s on empty data', () => {
            useFilteredAutomatedInteractionsMock.mockReturnValue({
                data: {
                    value: null,
                    prevValue: null,
                },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAutomationCostSavedTrend(statsFilters, userTimezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0,
                    prevValue: 0,
                },
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchAutomationCostSavedTrend', () => {
        beforeEach(() => {
            fetchFilteredAutomatedInteractionsMock.mockResolvedValue(
                trendResponse,
            )
        })

        it('should calculate and format trend', async () => {
            const result = await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(result).toEqual({
                data: formatCostSavedData(
                    trendResponse,
                    moneySavedPerInteractionWithAutomate,
                ),
                isError: false,
                isFetching: false,
            })
        })
    })
})
