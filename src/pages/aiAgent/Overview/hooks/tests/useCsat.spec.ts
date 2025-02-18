import {renderHook} from '@testing-library/react-hooks/dom'

import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters, StatType} from 'models/stat/types'
import {useCsat} from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useCsat', () => {
    it('useCsat return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() => useCsat(filters, timezone))

        expect(result.current).toEqual({
            title: 'CSAT (Customer Satisfaction Score)',
            hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 3.1,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const {result} = renderHook(() => useCsat(filters, timezone))

        expect(result.current).toEqual({
            title: 'CSAT (Customer Satisfaction Score)',
            hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            isLoading: true,
        })
    })
})
