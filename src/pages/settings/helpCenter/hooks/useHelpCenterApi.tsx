import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react'

import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'
import {getHelpCenterAuthApiBaseUrl} from '../../../../utils/environment'

type UseHelpCenterApiInterface = {
    isReady: boolean
    client: HelpCenterClient | undefined
}

let accessToken: string | null
let createAccessTokenPendingRequest: ReturnType<
    HelpCenterClient['createAccessToken']
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

interface HelpCenterApiClientState {
    isReady: boolean
    client: HelpCenterClient | undefined
}

const HelpCenterApiClientContext = createContext<HelpCenterApiClientState>({
    isReady: false,
    client: undefined,
})

interface HelpCenterApiClientProviderProps {
    children: ReactNode
}

export const HelpCenterApiClientProvider = ({
    children,
}: HelpCenterApiClientProviderProps) => {
    const [state, setState] = useState<HelpCenterApiClientState>({
        isReady: false,
        client: undefined,
    })
    const initClient = async () => {
        const newClient = await getHelpCenterClient()
        newClient.interceptors.request.use(async (config) => {
            // Prevent recursion while doing auth calls
            if (config.url === '/api/help-center/auth') {
                return config
            }

            if (!isValidAccessToken(accessToken)) {
                await renewAccessToken(newClient)
            }

            return {
                ...config,
                headers: {
                    ...config.headers,
                    authorization: `Bearer ${accessToken || ''}`,
                },
            }
        })
        setState({
            client: newClient,
            isReady: true,
        })
    }

    useEffect(() => {
        void initClient()
    }, [])

    return (
        <HelpCenterApiClientContext.Provider value={state}>
            {children}
        </HelpCenterApiClientContext.Provider>
    )
}

export const useHelpCenterApi = (): UseHelpCenterApiInterface => {
    const {isReady, client} = useContext(HelpCenterApiClientContext)

    return {
        isReady,
        client,
    }
}
