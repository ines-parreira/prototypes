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
    let accessToken: string | null
    let authPendingRequest: Promise<AxiosResponse> | null

    const renewAccessToken = async () => {
        // Prevent multiple /auth calls if parallel requests are made
        if (authPendingRequest) {
            await authPendingRequest
            return
        }

        authPendingRequest = gorgiasApiClient.post('/gorgias-apps/auth')

        const {
            data: {token},
        } = await authPendingRequest
        accessToken = token
        authPendingRequest = null
    }

    const gorgiasAppsAuthInterceptor = async (config: AxiosRequestConfig) => {
        if (!isValidAccessToken(accessToken)) {
            await renewAccessToken()
        }

        return {
            ...config,
            headers: {
                ...config.headers,
                authorization: `Bearer ${accessToken || ''}`,
            },
        }
    }

    return gorgiasAppsAuthInterceptor
}

// This axios interceptor is adding JWT token to headers
// If token was not created or expired, it makes a call to `/gorgias-apps/auth` to renew it
//
// Should be used like this:
// import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
// ...
// axiosClient.interceptors.request.use(gorgiasAppsAuthInterceptor)
export default buildGorgiasAppsAuthInterceptor()
