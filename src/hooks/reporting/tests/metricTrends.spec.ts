import {renderHook} from '@testing-library/react-hooks'
import {TicketChannel} from 'business/types/ticket'
import {StatsFilters} from 'models/stat/types'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useResolutionTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from '../metricTrends'
import {MetricTrend} from '../useMetricTrend'

jest.mock(
    '../createUseMetricTrend',
    () =>
        (queryCreator: (filters: StatsFilters) => MetricTrend) =>
        (filters: StatsFilters) => {
            return queryCreator(filters)
        }
)

describe('metric trends', () => {
    describe.each([
        ['useCustomerSatisfactionTrend', useCustomerSatisfactionTrend],
        ['useFirstResponseTimeTrend', useFirstResponseTimeTrend],
        ['useMessagesPerTicketTrend', useMessagesPerTicketTrend],
        ['useResolutionTimeTrend', useResolutionTimeTrend],
        ['useClosedTicketsTrend', useClosedTicketsTrend],
        ['useTicketsCreatedTrend', useTicketsCreatedTrend],
        ['useTicketsRepliedTrend', useTicketsRepliedTrend],
        ['useMessagesSentTrend', useMessagesSentTrend],
    ])('%s', (testName, useTrendFn) => {
        it('should create reporting filters', () => {
            const {result} = renderHook(() =>
                useTrendFn({
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+02:00',
                    },
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                    integrations: [1],
                    agents: [2],
                    tags: [1, 2],
                })
            )
            expect(result.current).toMatchSnapshot()
        })
    })
})
