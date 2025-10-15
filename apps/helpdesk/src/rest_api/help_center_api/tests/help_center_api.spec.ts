import MockAdapter from 'axios-mock-adapter'

import * as auth from 'rest_api/auth'
import {
    buildHelpCenterClient,
    getHelpCenterClient,
} from 'rest_api/help_center_api/index'

const TOKEN_EXAMPLE =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudF9pZCI6MSwicm9sZSI6eyJuYW1lIjoiYWRtaW4ifSwicnVsZXMiOlt7ImFjdGlvbiI6Im1hbmFnZSIsInN1YmplY3QiOiJhbGwifV0sImlhdCI6MTc0OTU1MTUxMiwiZXhwIjoxNzQ5NTUzMzEyfQ.0DBS0ttuHQARRmOnT9arVW34EMw36GMcTXwj-43KSQo' // gitleaks:allow

const authCall = jest
    .spyOn(auth, 'getAccessToken')
    .mockResolvedValue(TOKEN_EXAMPLE)

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
                Authorization: `Bearer ${TOKEN_EXAMPLE}`,
            })
            expect(authCall).toHaveBeenCalled()
        })
    })

    describe('buildHelpCenterClient', () => {
        it('should return the same client without calling auth', async () => {
            const { client } = await buildHelpCenterClient()
            expect(client).toBeDefined()
            expect(authCall).not.toHaveBeenCalled()
        })
    })
})
