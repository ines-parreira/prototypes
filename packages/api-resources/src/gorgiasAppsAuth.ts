import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'

import gorgiasApiClient from './client'

type GorgiasAppAuthServiceOptions = {
    client?: string
}

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
    authPendingRequest: Promise<AxiosResponse<{ token: string }>> | null = null

    constructor(private readonly options: GorgiasAppAuthServiceOptions = {}) {}

    private setAccessToken(token: string) {
        this.accessToken = token
    }

    public clearAccessToken() {
        this.accessToken = null
    }

    private async renewAccessToken() {
        if (this.authPendingRequest) {
            await this.authPendingRequest
            return
        }

        this.authPendingRequest = gorgiasApiClient.post(
            '/gorgias-apps/auth',
            this.options.client ? { client: this.options.client } : undefined,
        )

        try {
            const {
                data: { token },
            } = await this.authPendingRequest

            this.setAccessToken(token)
        } finally {
            this.authPendingRequest = null
        }
    }

    public async getAccessToken() {
        const accessToken = await this.getRawAccessToken()

        return accessToken ? `Bearer ${accessToken}` : ''
    }

    public async getRawAccessToken() {
        if (!isValidAccessToken(this.accessToken)) {
            await this.renewAccessToken()
        }

        return this.accessToken ?? ''
    }

    public async getAccessTokenHeaders() {
        const axiosHeaders = new AxiosHeaders()

        axiosHeaders.setAuthorization(await this.getAccessToken())

        return axiosHeaders
    }
}

export const gorgiasAppsAuthInterceptor = buildGorgiasAppsAuthInterceptor()

export default gorgiasAppsAuthInterceptor
