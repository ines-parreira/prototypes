import React from 'react'

import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'
import {getHelpCenterAuthApiBaseUrl} from '../../../../utils/environment'

type UseHelpCenterApiInterface = {
    isReady: boolean
    client: HelpCenterClient | undefined
}

let client: HelpCenterClient
let accessToken: string | null
let createAccessTokenPendingRequest: ReturnType<
    typeof client.createAccessToken
> | null = null

const isValidAccessToken = (token: string | null) => {
    if (!token) {
        return false
    }

    const {exp} = JSON.parse(atob(token.split('.')[1]))
    const expirationDate = new Date(exp * 1000)
    return new Date() < expirationDate
}

const renewAccessToken = async (client: HelpCenterClient): Promise<void> => {
    // Prevent multiple /auth calls if parallel requests are made
    if (createAccessTokenPendingRequest) {
        await createAccessTokenPendingRequest
        return
    }

    createAccessTokenPendingRequest = client.createAccessToken(
        undefined,
        undefined,
        {
            baseURL: getHelpCenterAuthApiBaseUrl(),
            withCredentials: true,
        }
    )
    const {
        data: {access_token: tokenFromResponse},
    } = await createAccessTokenPendingRequest
    accessToken = tokenFromResponse
    createAccessTokenPendingRequest = null
}

export const useHelpcenterApi = (): UseHelpCenterApiInterface => {
    const [isReady, setReady] = React.useState(client !== undefined)

    React.useEffect(() => {
        async function init() {
            setReady(false)
            client = await getHelpCenterClient()
            client.interceptors.request.use(async (config) => {
                // Prevent recursion while doing auth calls
                if (config.url === '/api/help-center/auth') {
                    return config
                }

                if (!isValidAccessToken(accessToken)) {
                    await renewAccessToken(client)
                }

                return {
                    ...config,
                    headers: {
                        ...config.headers,
                        authorization: `Bearer ${accessToken || ''}`,
                    },
                }
            })

            setReady(true)
        }
        if (client === undefined) {
            void init()
        }
    }, [])

    return {
        isReady,
        client,
    }
}
