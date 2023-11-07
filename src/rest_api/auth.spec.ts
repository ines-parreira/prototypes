import MockAdapter from 'axios-mock-adapter'

import {helpCenterAPI} from './help_center_api/client'
import {getAccessToken, isValidAccessToken} from './auth'

const generateTokenFromExpiry = (exp: number) =>
    `header.${btoa(
        // Adding a random id to make sure token is different on each time is generated
        JSON.stringify({exp, randomId: Math.random().toString(16)})
    )}.signature`
const nowInSeconds = () => Math.floor(Date.now() / 1000)

describe('utils', () => {
    beforeAll(async () => {
        const helpCenterClient = await helpCenterAPI.getClient()
        const mockAPI = new MockAdapter(helpCenterClient)

        mockAPI.onPost('/api/help-center/auth').reply(() => [
            200,
            {
                access_token: generateTokenFromExpiry(nowInSeconds() + 1),
            },
        ])
    })

    test('isValidAccessToken', () => {
        const now = nowInSeconds()

        const validJwtExp = now + 60
        const expiredJwtExp = now - 60

        const validJwt = generateTokenFromExpiry(validJwtExp)
        const expiredJwt = generateTokenFromExpiry(expiredJwtExp)

        expect(isValidAccessToken(validJwt)).toEqual(true)
        expect(isValidAccessToken(expiredJwt)).toEqual(false)
    })

    describe('getAccessToken', () => {
        it('should not renew the token on 2 consecutive calls', async () => {
            const firstToken = await getAccessToken()
            const secondToken = await getAccessToken()

            expect(firstToken).toBeDefined()
            expect(firstToken).toEqual(secondToken)
        })

        it('should renew the token after the expiry timeout', async () => {
            const firstToken = await getAccessToken()
            expect(firstToken).toBeDefined()

            // wait the expiry time
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const secondToken = await getAccessToken()
            expect(secondToken).toBeDefined()

            expect(firstToken).not.toEqual(secondToken)
        })

        it('should renew the token after 2 consecutive requests if forceRefresh is given', async () => {
            const firstToken = await getAccessToken()
            expect(firstToken).toBeDefined()

            const secondToken = await getAccessToken(true)
            expect(secondToken).toBeDefined()

            expect(firstToken).not.toEqual(secondToken)
        })
    })
})
