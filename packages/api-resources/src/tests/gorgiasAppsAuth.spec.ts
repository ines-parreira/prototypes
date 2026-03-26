import type { AxiosInstance } from 'axios'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import MockDate from 'mockdate'

import client from '../client'
import { buildGorgiasAppsAuthInterceptor } from '../gorgiasAppsAuth'

const TOKEN_EXAMPLE =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdEMW5OMW1icDdDRmpicFNVVXdaRGJsaWNWcmJYU3g3QXk2RXhFMWdMTkkifQ.eyJ1c2VyX2lkIjoxLCJhY2NvdW50X2lkIjoxLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjE5MjM5OTYwNjN9.VTcH71te0m21MAUDO284nOlTpVmGgITwpazWnaUsDNR4yuPoRri4kpUbjclo2cvqYjGtmaJN7y28c25iDws2ivEXaFTPDvUUW2A7yjmVcPu3zCeIyDGS2mFsiqHgscaDe4FvEEb_BxN5UnGrkXfk90NEMsv9Skcg4-gd1m9WAZTTFRZ1v28M8uzDhZwghMR_FnkzH_0Zwg-nZ0mgm8sYFrOXyx6bc5khvve-5NA7oj8eeXgr5v4PWQRJ8VpcuzWQS-A4I_SYAv4zox8qu999c_TLxSU_Iad8Xq84nVILBFPQneSyt_ep6ziTuoUpV4QqcKXyQhNBMzZEqBxmWn0Xrg' // gitleaks:allow

describe('gorgiasAppsAuth', () => {
    let axiosClient: AxiosInstance
    let mockGorgiasAPI: MockAdapter
    let mockAppAPI: MockAdapter

    beforeEach(() => {
        const interceptor = buildGorgiasAppsAuthInterceptor()

        axiosClient = axios.create()
        axiosClient.interceptors.request.use(interceptor)

        mockGorgiasAPI = new MockAdapter(client)
        mockAppAPI = new MockAdapter(axiosClient)

        mockGorgiasAPI.onPost('/gorgias-apps/auth').reply(200, {
            token: TOKEN_EXAMPLE,
        })
        mockAppAPI.onGet('/test').reply(200)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('passes the access token in the request headers', async () => {
        await axiosClient.get('/test')

        expect(mockAppAPI.history.get.length).toBe(1)
        expect(mockAppAPI.history.get[0].headers).toMatchObject({
            Authorization: `Bearer ${TOKEN_EXAMPLE}`,
        })
    })

    it('renews the token when it is expired', async () => {
        await axiosClient.get('/test')

        MockDate.set(new Date(3000, 1, 1))

        await axiosClient.get('/test')

        expect(mockGorgiasAPI.history.post.length).toBe(2)
    })

    it('makes a single auth call for parallel requests', async () => {
        await Promise.all([
            axiosClient.get('/test'),
            axiosClient.get('/test'),
            axiosClient.get('/test'),
            axiosClient.get('/test'),
            axiosClient.get('/test'),
        ])

        expect(mockAppAPI.history.get.length).toBe(5)
        expect(mockGorgiasAPI.history.post.length).toBe(1)
    })
})
