import MockAdapter from 'axios-mock-adapter'
import * as auth from 'rest_api/auth'
import {getHelpCenterClient} from 'rest_api/help_center_api/index'

const TOKEN_EXAMPLE =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdEMW5OMW1icDdDRmpicFNVVXdaRGJsaWNWcmJYU3g3QXk2RXhFMWdMTkkifQ.eyJ1c2VyX2lkIjoxLCJhY2NvdW50X2lkIjoxLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjE5MjM5OTYwNjN9.VTcH71te0m21MAUDO284nOlTpVmGgITwpazWnaUsDNR4yuPoRri4kpUbjclo2cvqYjGtmaJN7y28c25iDws2ivEXaFTPDvUUW2A7yjmVcPu3zCeIyDGS2mFsiqHgscaDe4FvEEb_BxN5UnGrkXfk90NEMsv9Skcg4-gd1m9WAZTTFRZ1v28M8uzDhZwghMR_FnkzH_0Zwg-nZ0mgm8sYFrOXyx6bc5khvve-5NA7oj8eeXgr5v4PWQRJ8VpcuzWQS-A4I_SYAv4zox8qu999c_TLxSU_Iad8Xq84nVILBFPQneSyt_ep6ziTuoUpV4QqcKXyQhNBMzZEqBxmWn0Xrg'
jest.mock('rest_api/auth', () => {
    const actual = jest.requireActual('rest_api/auth')
    console.log(actual)
    return {
        ...actual,
    }
})

describe('help_center_api', () => {
    describe('getHelpCenterClient', () => {
        it('should set Authorization header', async () => {
            jest.spyOn(auth, 'getAccessToken').mockResolvedValue(TOKEN_EXAMPLE)
            const axiosClient = await getHelpCenterClient()
            const mockAppAPI = new MockAdapter(axiosClient)
            mockAppAPI.onGet('/test').reply(200, {data: []})

            await axiosClient.get('/test')

            expect(mockAppAPI.history.get.length).toBe(1)
            expect(mockAppAPI.history.get[0].headers).toMatchObject({
                Authorization: `Bearer ${TOKEN_EXAMPLE}`,
            })
        })
    })
})
