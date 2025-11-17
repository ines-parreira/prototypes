import { getHelpCenterAuthApiBaseUrl } from '@repo/utils'

import type { HelpCenterClient } from './help_center_api/client'
import { helpCenterAPI } from './help_center_api/client'

export function isValidAccessToken(token: string | null): boolean {
    if (!token) {
        return false
    }

    const { exp } = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(exp * 1000)
    return new Date() < expirationDate
}

export const getAccessToken = (() => {
    // Note: using closure here

    let accessToken: string | null
    let createAccessTokenPendingRequest: ReturnType<
        HelpCenterClient['createAccessToken']
    > | null = null

    async function renewAccessToken(): Promise<void> {
        // There should not be a problem calling getClient every time as the init is called just once.
        // See docs: https://github.com/anttiviljami/openapi-client-axios/blob/master/DOCS.md#getclient
        const helpCenterClient =
            await helpCenterAPI.getClient<HelpCenterClient>()

        // Prevent multiple /auth calls if parallel requests are made
        if (createAccessTokenPendingRequest) {
            await createAccessTokenPendingRequest
            return
        }

        createAccessTokenPendingRequest = helpCenterClient.createAccessToken(
            undefined,
            undefined,
            {
                baseURL: getHelpCenterAuthApiBaseUrl(),
                withCredentials: true,
            },
        )
        const {
            data: { access_token: tokenFromResponse },
        } = await createAccessTokenPendingRequest
        accessToken = tokenFromResponse
        createAccessTokenPendingRequest = null
    }

    return async (forceRefresh?: boolean) => {
        if (!isValidAccessToken(accessToken) || forceRefresh) {
            await renewAccessToken()
        }

        return accessToken
    }
})()

export const getBearerAuthorizationHeader = (token: string) => {
    return `Bearer ${token}`
}
