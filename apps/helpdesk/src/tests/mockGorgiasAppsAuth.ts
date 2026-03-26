jest.mock('@repo/api-resources/gorgiasAppsAuth', () => {
    const { AxiosHeaders } = require('axios')

    const interceptor = jest.fn(async (config) => {
        const headers = AxiosHeaders.from(config.headers ?? {})

        headers.setAuthorization('Bearer test-token')

        return {
            ...config,
            headers,
        }
    })

    return {
        __esModule: true,
        buildGorgiasAppsAuthInterceptor: jest.fn(() => interceptor),
        GorgiasAppAuthService: jest.fn(),
        default: interceptor,
    }
})

export {}
