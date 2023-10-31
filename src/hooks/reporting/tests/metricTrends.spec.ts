import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {TicketChannel} from 'business/types/ticket'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'
import {
    useAutomatedInteractionsTrend,
    useAutomationRateTrend,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useFirstResponseTimeWithAutomationTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useOverallTimeSavedWithAutomationTrend,
    useMedianResolutionTimeTrend,
    useResolutionTimeWithAutomationTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from '../metricTrends'

jest.mock('../useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('metric trends', () => {
    useMetricTrendMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any
    )
    describe.each([
        ['useCustomerSatisfactionTrend', useCustomerSatisfactionTrend],
        ['useMedianFirstResponseTimeTrend', useMedianFirstResponseTimeTrend],
        ['useMedianResolutionTimeTrend', useMedianResolutionTimeTrend],
        ['useClosedTicketsTrend', useClosedTicketsTrend],
        ['useTicketsCreatedTrend', useTicketsCreatedTrend],
    ])('%s', (_testName, useTrendFn) => {
        it('should create reporting filters', () => {
            const {result} = renderHook(() =>
                useTrendFn(
                    {
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                        channels: [TicketChannel.Email, TicketChannel.Chat],
                        integrations: [1],
                        agents: [2],
                        tags: [1, 2],
                    },
                    'UTC'
                )
            )
            expect(result.current).toMatchSnapshot()
        })
    })

    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useOpenTicketsTrend', () => {
        it('should call useMetricTrend with two queries', () => {
            renderHook(() => useOpenTicketsTrend(statsFilters, timezone))
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                openTicketsQueryFactory(statsFilters, timezone),
                openTicketsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('useTicketsRepliedTrend', () => {
        it('should call useMetricTrend with two queries', () => {
            renderHook(() => useTicketsRepliedTrend(statsFilters, timezone))
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                ticketsRepliedQueryFactory(statsFilters, timezone),
                ticketsRepliedQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('useMessagesSentTrend', () => {
        it('should call useMetricTrend with two queries', () => {
            renderHook(() => useMessagesSentTrend(statsFilters, timezone))
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                messagesSentQueryFactory(statsFilters, timezone),
                messagesSentQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('useMessagesPerTicketTrend', () => {
        it('should call useMetricTrend with two queries', () => {
            renderHook(() => useMessagesPerTicketTrend(statsFilters, timezone))
            expect(useMetricTrendMock).toHaveBeenCalledWith(
                messagesPerTicketQueryFactory(statsFilters, timezone),
                messagesPerTicketQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('Automation add-on', () => {
        describe.each([
            [
                'useFirstResponseTimeWithAutomationTrend',
                useFirstResponseTimeWithAutomationTrend,
            ],
            [
                'useResolutionTimeWithAutomationTrend',
                useResolutionTimeWithAutomationTrend,
            ],
            [
                'useOverallTimeSavedWithAutomationTrend',
                useOverallTimeSavedWithAutomationTrend,
            ],
            ['useAutomationRateTrend', useAutomationRateTrend],
            ['useAutomatedInteractionTrend', useAutomatedInteractionsTrend],
        ])('%s', (_testName, useTrendFn) => {
            it('should create automation filters', () => {
                const {result} = renderHook(() =>
                    useTrendFn(
                        {
                            period: {
                                start_datetime: '2021-05-29T00:00:00+02:00',
                                end_datetime: '2021-06-04T23:59:59+02:00',
                            },
                            channels: [],
                            integrations: [],
                            agents: [],
                            tags: [],
                        },
                        'UTC'
                    )
                )
                expect(result.current).toMatchSnapshot()
            })
        })
    })
})
