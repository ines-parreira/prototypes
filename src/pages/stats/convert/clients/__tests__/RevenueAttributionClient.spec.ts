import { TicketChannel } from 'business/types/ticket'
import { REVENUE_PER_DAY } from 'config/stats'
import { fetchStat } from 'models/stat/resources'
import { getTicketsPerformanceData } from 'pages/stats/convert/clients/RevenueAttributionClient'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('models/stat/resources')
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
