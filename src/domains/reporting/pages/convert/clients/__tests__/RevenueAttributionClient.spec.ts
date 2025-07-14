import { TicketChannel } from 'business/types/ticket'
import { REVENUE_PER_DAY } from 'domains/reporting/config/stats'
import { fetchStat } from 'domains/reporting/models/stat/resources'
import { getTicketsPerformanceData } from 'domains/reporting/pages/convert/clients/RevenueAttributionClient'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/models/stat/resources')
const fetchStatMock = assumeMock(fetchStat)

describe('RevenueAttributionClient', () => {
    it('should calls fetchStat with filters', async () => {
        const startDate = '2021-05-29T00:00:00+02:00'
        const endDate = '2021-05-30T00:00:00+02:00'
        const campaignIds = ['1', '2']
        const integrationIds = [4, 5]
        const channels = [TicketChannel.Sms]

        await getTicketsPerformanceData({
            startDate,
            endDate,
            campaignIds,
            integrationIds,
            channels,
        })

        expect(fetchStatMock).toHaveBeenCalledWith(REVENUE_PER_DAY, {
            filters: {
                period: {
                    start_datetime: formatReportingQueryDate(startDate),
                    end_datetime: formatReportingQueryDate(endDate),
                },
                campaigns: campaignIds,
                integrations: integrationIds,
                channels: channels,
            },
        })
    })
})
