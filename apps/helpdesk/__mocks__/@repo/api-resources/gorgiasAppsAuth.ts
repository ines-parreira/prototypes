import { AxiosHeaders } from 'axios'

const mockedAccessToken = 'Bearer mocked-token'

const gorgiasAppsAuthInterceptor = jest.fn((config) => config)

export const buildGorgiasAppsAuthInterceptor = jest.fn(
    () => gorgiasAppsAuthInterceptor,
)

export class GorgiasAppAuthService {
    accessToken: string | null = null
    authPendingRequest: Promise<unknown> | null = null

    getAccessToken = jest.fn(async () => mockedAccessToken)

    getAccessTokenHeaders = jest.fn(
        async () =>
            new AxiosHeaders({
                Authorization: mockedAccessToken,
            }),
    )
}

export { gorgiasAppsAuthInterceptor }
