import {Client} from 'pages/stats/revenue/clients/CubeProxyClient'
import {CubeQueryBody} from 'pages/stats/revenue/clients/types'

describe('Calling CubeProxyClient', () => {
    const query = {
        dimensions: [`OrderConversion.campaignId`],
        measures: [
            `OrderConversion.traffic`,
            `OrderConversion.impressions`,
            `OrderConversion.uniqueImpressions`,
            `OrderConversion.clicks`,
            `OrderConversion.clicksRate`,
        ],
        filters: [
            {
                member: `OrderConversion.createdDatetime`,
                operator: 'inDateRange',
                values: ['2018-01-01', '2024-01-03'],
            },
            {
                member: `OrderConversion.shopName`,
                operator: 'equals',
                values: 'fake-jewels-store',
            },
            {
                member: `OrderConversion.campaignId`,
                operator: 'equals',
                values: ['campaignId1', 'campaignId2'],
            },
        ],
        segments: [`OrderConversion.campaignEventsOnly`],
        limit: 10,
        offset: 20,
    } as unknown as CubeQueryBody

    it('should call with stringified query', async () => {
        // arrange
        const expectedData = {
            hello: 'kitty',
        }
        const mockPost = jest.fn(() => Promise.resolve({data: expectedData}))
        const clientMock = {
            post: mockPost,
        }
        // @ts-ignore - we pass fake client mock
        const cubeProxyClient = new Client(clientMock)

        // act
        const response = await cubeProxyClient.load(query)

        // assert
        expect(mockPost).toMatchSnapshot()
        expect(response).toStrictEqual(expectedData)
    })
})
