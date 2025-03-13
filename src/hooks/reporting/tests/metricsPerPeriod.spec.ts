import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import { useTagsTicketCount } from 'hooks/reporting/metricsPerPeriod'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { tagsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters: StatsFilters = {
    period: {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    },
    channels: withDefaultLogicalOperator([
        TicketChannel.Email,
        TicketChannel.Chat,
    ]),
    integrations: withDefaultLogicalOperator([1]),
    tags: [
        {
            ...withDefaultLogicalOperator([1, 2]),
            filterInstanceId: TagFilterInstanceId.First,
        },
    ],
}
const timezone = 'someTimeZone'
const sorting = OrderDirection.Asc

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useTagsTicketCount', () => {
    it('should pass the query to useMetricPerDimension hook', () => {
        renderHook(() => useTagsTicketCount(statsFilters, timezone, sorting))

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
                sorting,
            ),
        )
    })

    it('should test the returned result of useTagsTicketCount', () => {
        const responseMock = {
            data: { allData: [], value: null, decile: null },
            isFetching: false,
            isError: false,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)
        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)

        const result = useTagsTicketCount(statsFilters, timezone, sorting)

        expect(result).toStrictEqual({
            data: { prevValue: [], value: [] },
            isError: responseMock.isError,
            isFetching: responseMock.isFetching,
        })
    })

    it('should return isError:true', () => {
        const errorMock = {
            data: { allData: [], value: null, decile: null },
            isFetching: false,
            isError: true,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)
        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)

        const result = useTagsTicketCount(statsFilters, timezone, sorting)

        expect(result).toStrictEqual({
            data: { prevValue: [], value: [] },
            isError: errorMock.isError,
            isFetching: errorMock.isFetching,
        })
    })
})
