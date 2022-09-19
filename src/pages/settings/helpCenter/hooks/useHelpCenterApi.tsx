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
} from 'rest_api/help_center_api/index'

type UseHelpCenterApiInterface = {
    isReady: boolean
    client: HelpCenterClient | undefined
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
        const client = await getHelpCenterClient()

        setState({
            client,
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
