import {TicketChannel} from 'business/types/ticket'
import {TicketStateMember} from 'models/reporting/types'
import {statsFiltersToReportingFilters} from 'utils/reporting'

describe('reporting utils', () => {
    describe('statsFiltersToReportingFilters', () => {
        it('should convert StatsFilters to an array of ReportingFilter', () => {
            expect(
                statsFiltersToReportingFilters(TicketStateMember, {
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+02:00',
                    },
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                    integrations: [1],
                    agents: [2],
                    tags: [1, 2],
                })
            ).toMatchSnapshot()
        })
    })
})
