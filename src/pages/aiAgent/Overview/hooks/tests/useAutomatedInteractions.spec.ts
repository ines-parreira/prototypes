import {renderHook} from '@testing-library/react-hooks/dom'

import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters, StatType} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

import {useAutomatedInteractions} from '../useAutomatedInteractions'

jest.mock('hooks/reporting/useMultipleMetricsTrend')

const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useAutomatedInteractions', () => {
    it('should return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            data: {
                'AutomationDataset.automatedInteractions': {
                    value: 450,
                    prevValue: 300,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() =>
            useAutomatedInteractions(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            value: 450,
            prevValue: 300,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            isFetching: true,
        } as any)

        const {result} = renderHook(() =>
            useAutomatedInteractions(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            isLoading: true,
        })
    })
})
