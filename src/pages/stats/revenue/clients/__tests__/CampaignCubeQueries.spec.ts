import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getCampaignsPerformanceGraphData,
    getRevenueUpliftGraphData,
    getStoreRevenueTotalData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {REPORTING_ENDPOINT} from 'models/reporting/resources'

const mockedServer = new MockAdapter(client)

describe('Calling CubeClient functions', () => {
    const props = {
        startDate: '2023-01-01T00:00:00-08:00',
        endDate: '2023-03-15T23:59:59-07:00',
        shopName: 'punched-tires-shop',
        campaignIds: ['1', '2'],
        limit: 100,
        offset: 200,
    }

    beforeEach(() => {
        mockedServer.reset()
    })

    it.each([
        [getCampaignEventsPerformanceData],
        [getCampaignOrderPerformanceData],
        [getCampaignEventsOrdersPerformanceData],
        [getCampaignEventsTotalsData],
        [getCampaignOrderTotalsData],
        [getStoreRevenueTotalData],
        [getRevenueUpliftGraphData],
        [getCampaignsPerformanceGraphData],
    ])('%p should call load', async (cubeFn) => {
        // arrange
        let expectedData
        const expectedResponse = {hello: cubeFn.toString()}

        mockedServer.onPost(REPORTING_ENDPOINT).reply((config) => {
            expectedData = config.data
            return [200, expectedResponse]
        })

        // act
        await cubeFn(props)

        // assert
        expect(expectedResponse).toStrictEqual(expectedResponse)
        expect(JSON.parse(expectedData || '{}')).toMatchSnapshot()
    })
})
