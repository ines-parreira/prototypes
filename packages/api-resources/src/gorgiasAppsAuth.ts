import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'

import gorgiasApiClient from './client'

function isValidAccessToken(token: string | null): boolean {
    if (!token) {
        return false
    }

    const { exp } = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(exp * 1000)

    return new Date() < expirationDate
}

export const buildGorgiasAppsAuthInterceptor = () => {
    const authService = new GorgiasAppAuthService()

    return async (config: InternalAxiosRequestConfig) => {
        const accessToken = await authService.getAccessToken()

        config.headers.setAuthorization(accessToken)

        return config
    }
}

export class GorgiasAppAuthService {
    accessToken: string | null = null
    authPendingRequest: Promise<AxiosResponse> | null = null

    private setAccessToken(token: string) {
        this.accessToken = token
    }

    private async renewAccessToken() {
        if (this.authPendingRequest) {
            await this.authPendingRequest
            return
        }

        this.authPendingRequest = gorgiasApiClient.post('/gorgias-apps/auth')

        const {
            data: { token },
        } = await this.authPendingRequest

        this.setAccessToken(token)
        this.authPendingRequest = null
    }

    public async getAccessToken() {
        if (!isValidAccessToken(this.accessToken)) {
            await this.renewAccessToken()
        }

        return this.accessToken ? `Bearer ${this.accessToken}` : ''
    }

    public async getAccessTokenHeaders() {
        const axiosHeaders = new AxiosHeaders()

        axiosHeaders.setAuthorization(await this.getAccessToken())

        return axiosHeaders
    }
}

export const gorgiasAppsAuthInterceptor = buildGorgiasAppsAuthInterceptor()

export default gorgiasAppsAuthInterceptor
