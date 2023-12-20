import {AxiosRequestConfig, AxiosResponse} from 'axios'
import gorgiasApiClient from 'models/api/resources'

function isValidAccessToken(token: string | null): boolean {
    if (!token) {
        return false
    }

    const {exp} = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(exp * 1000)
    return new Date() < expirationDate
}

// This function should not be imported to the production code, it is exported just for tests
// Use default export instead
export const buildGorgiasAppsAuthInterceptor = () => {
    const authService = new GorgiasAppAuthService()

    const gorgiasAppsAuthInterceptor = async (config: AxiosRequestConfig) => {
        const accessTokenHeaders = await authService.getAccessTokenHeaders()

        return {
            ...config,
            headers: {
                ...config.headers,
                ...accessTokenHeaders,
            },
        }
    }

    return gorgiasAppsAuthInterceptor
}

export class GorgiasAppAuthService {
    accessToken: string | null = null
    authPendingRequest: Promise<AxiosResponse> | null = null

    private setAccessToken(token: string) {
        this.accessToken = token
    }

    private async renewAccessToken() {
        // Prevent multiple /auth calls if parallel requests are made
        if (this.authPendingRequest) {
            await this.authPendingRequest
            return
        }

        this.authPendingRequest = gorgiasApiClient.post('/gorgias-apps/auth')

        const {
            data: {token},
        } = await this.authPendingRequest
        this.setAccessToken(token)
        this.authPendingRequest = null
    }

    public async getAccessTokenHeaders() {
        if (!isValidAccessToken(this.accessToken)) {
            await this.renewAccessToken()
        }
        return {
            authorization: this.accessToken ? `Bearer ${this.accessToken}` : '',
        }
    }
}

// This axios interceptor is adding JWT token to headers
// If token was not created or expired, it makes a call to `/gorgias-apps/auth` to renew it
//
// Should be used like this:
// import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
// ...
// axiosClient.interceptors.request.use(gorgiasAppsAuthInterceptor)
export default buildGorgiasAppsAuthInterceptor()
