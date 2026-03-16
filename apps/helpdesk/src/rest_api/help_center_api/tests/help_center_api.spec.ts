import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {
    buildHelpCenterClient,
    getHelpCenterClient,
} from 'rest_api/help_center_api/index'

const MOCK_TOKEN = 'mock-token'

jest.mock('utils/gorgiasAppsAuth', () => {
    return {
        GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
            accessToken: MOCK_TOKEN,
            getAccessToken: jest.fn().mockResolvedValue(`Bearer ${MOCK_TOKEN}`),
        })),
    }
})

beforeEach(() => {
    jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
            rules: [{ action: 'manage', subject: 'all' }],
        },
    })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('help_center_api', () => {
    describe('getHelpCenterClient', () => {
        it('should set Authorization header', async () => {
            const { client: axiosClient, agentAbility } =
                await getHelpCenterClient()
            const mockAppAPI = new MockAdapter(axiosClient)
            mockAppAPI.onGet('/test').reply(200, { data: [] })

            await axiosClient.get('/test')
            expect(agentAbility).toBeDefined()
            expect(mockAppAPI.history.get.length).toBe(1)
            expect(mockAppAPI.history.get[0].headers).toMatchObject({
                Authorization: `Bearer ${MOCK_TOKEN}`,
            })
        })
    })

    describe('buildHelpCenterClient', () => {
        it('should return the same client without calling auth', async () => {
            const { client } = await buildHelpCenterClient()
            expect(client).toBeDefined()
        })
    })
})
