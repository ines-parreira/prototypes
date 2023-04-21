import {TicketChannel} from 'business/types/ticket'
import {ReportingGranularity} from 'models/reporting/types'
import {
    formatReportingQueryDate,
    periodToReportingGranularity,
    statsFiltersToReportingFilters,
    TicketStateStatsFiltersMembers,
} from 'utils/reporting'

describe('reporting utils', () => {
    describe('formatReportingQueryDate', () => {
        it('should remove the timezone', () => {
            expect(
                formatReportingQueryDate('2020-01-02T03:04:56.789-10:00')
            ).toBe('2020-01-02T03:04:56.789')
        })
    })

    describe('statsFiltersToReportingFilters', () => {
        it('should convert StatsFilters to an array of ReportingFilter', () => {
            expect(
                statsFiltersToReportingFilters(TicketStateStatsFiltersMembers, {
                    period: {
                        start_datetime: '2021-05-29T00:00:00.000+02:00',
                        end_datetime: '2021-06-04T23:59:59.000+02:00',
                    },
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                    integrations: [1],
                    agents: [2],
                    tags: [1, 2],
                })
            ).toMatchSnapshot()
        })
    })

    describe('periodToReportingGranularity', () => {
        it('should "month" when dates range is larger than 3 months', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2021-01-01T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Month)
        })

        it('should "week" when dates range is larger than 1 month', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-02-15T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Week)
        })

        it('should "days" when dates range is larger than 1 day', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-01-03T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Day)
        })

        it('should "hour" when dates range is smaller than 1 day', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-01-01T12:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Hour)
        })
    })
})
