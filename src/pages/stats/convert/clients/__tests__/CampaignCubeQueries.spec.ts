import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getCampaignsPerformanceGraphData,
    getRevenueGraphData,
    getRevenueShareGraphData,
    getStoreRevenueTotalData,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {SharedDimension} from '../constants'
import {GroupDimension} from '../types'

describe('Getting Cube queries', () => {
    const props = {
        // in UTC is already next day
        startDate: '2023-01-01T20:00:00-08:00',
        // in UTC is still prev day
        endDate: '2023-03-15T06:00:00-08:00',
        shopName: 'punched-tires-shop',
        campaignIds: ['1', '2'],
        limit: 100,
        offset: 200,
        timezone: 'America/San_Francisco',
        groupDimension: SharedDimension.campaignId as GroupDimension,
    }

    it.each([
        [getCampaignEventsTotalsData],
        [getCampaignOrderTotalsData],
        [getStoreRevenueTotalData],
        [getCampaignEventsPerformanceData],
        [getCampaignOrderPerformanceData],
        [getCampaignEventsOrdersPerformanceData],
        [getRevenueShareGraphData],
        [getCampaignsPerformanceGraphData],
        [getRevenueGraphData],
    ])('%p should call load', (cubeFn) => {
        // act
        const query = cubeFn(props)

        // assert
        expect(query).toMatchSnapshot()
    })
})
