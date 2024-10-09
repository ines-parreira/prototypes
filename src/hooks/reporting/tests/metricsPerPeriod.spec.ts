import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {TicketChannel} from 'business/types/ticket'
import {useTagsTicketCount} from 'hooks/reporting/metricsPerPeriod'
import {LegacyStatsFilters} from 'models/stat/types'
import {OrderDirection} from 'models/api/types'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {assumeMock} from 'utils/testing'
import {tagsTicketCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {getPreviousPeriod} from 'utils/reporting'

const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters: LegacyStatsFilters = {
    period: {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    },
    channels: [TicketChannel.Email, TicketChannel.Chat],
    integrations: [1],
    tags: [1, 2],
}
const timezone = 'someTimeZone'
const sorting = OrderDirection.Asc

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useTagsTicketCount', () => {
    it('should pass the query to useMetricPerDimension hook', () => {
        renderHook(() => useTagsTicketCount(statsFilters, timezone, sorting))

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(statsFilters, timezone, sorting)
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
                sorting
            )
        )
    })

    it('should test the returned result of useTagsTicketCount', () => {
        const responseMock = {
            data: {allData: [], value: null, decile: null},
            isFetching: false,
            isError: false,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)
        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)

        const result = useTagsTicketCount(statsFilters, timezone, sorting)

        expect(result).toStrictEqual({
            data: {prevValue: [], value: []},
            isError: responseMock.isError,
            isFetching: responseMock.isFetching,
        })
    })

    it('should return isError:true', () => {
        const errorMock = {
            data: {allData: [], value: null, decile: null},
            isFetching: false,
            isError: true,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)
        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)

        const result = useTagsTicketCount(statsFilters, timezone, sorting)

        expect(result).toStrictEqual({
            data: {prevValue: [], value: []},
            isError: errorMock.isError,
            isFetching: errorMock.isFetching,
        })
    })
})
