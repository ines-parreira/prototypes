import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
} from 'react'

import {
    getClickTrackingApiClient,
    ClickTrackingClient,
} from 'rest_api/click_tracking_api/client'

type UseClickTrackingApiInterface = {
    isReady: boolean
    client: ClickTrackingClient | undefined
}

interface ClickTrackingApiClientState {
    isReady: boolean
    client: ClickTrackingClient | undefined
}

const ClickTrackingApiClientContext =
    createContext<ClickTrackingApiClientState>({
        isReady: false,
        client: undefined,
    })

interface ClickTrackingApiClientProviderProps {
    children: ReactNode
}

export const ClickTrackingApiClientProvider = ({
    children,
}: ClickTrackingApiClientProviderProps) => {
    const [state, setState] = useState<ClickTrackingApiClientState>({
        isReady: false,
        client: undefined,
    })

    const initClient = async () => {
        const client = await getClickTrackingApiClient()

        setState({
            client,
            isReady: true,
        })
    }

    useEffect(() => {
        void initClient()
    }, [])

    const value = useMemo(
        () => ({
            ...state,
        }),
        [state]
    )

    return (
        <ClickTrackingApiClientContext.Provider value={value}>
            {children}
        </ClickTrackingApiClientContext.Provider>
    )
}

export const useClickTrackingApi = (): UseClickTrackingApiInterface => {
    const {isReady, client} = useContext(ClickTrackingApiClientContext)

    return {
        isReady,
        client,
    }
}
