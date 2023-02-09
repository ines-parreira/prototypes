import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
} from 'react'

import {
    getRevenueAddonApiClient,
    RevenueAddonClient,
} from 'rest_api/revenue_addon_api/client'

type UseRevenueAddonApiInterface = {
    isReady: boolean
    client: RevenueAddonClient | undefined
}

interface RevenueAddonApiClientState {
    isReady: boolean
    client: RevenueAddonClient | undefined
}

const RevenueAddonApiClientContext = createContext<RevenueAddonApiClientState>({
    isReady: false,
    client: undefined,
})

interface RevenueAddonApiClientProviderProps {
    children: ReactNode
}

export const RevenueAddonApiClientProvider = ({
    children,
}: RevenueAddonApiClientProviderProps) => {
    const [state, setState] = useState<RevenueAddonApiClientState>({
        isReady: false,
        client: undefined,
    })

    const initClient = async () => {
        const client = await getRevenueAddonApiClient()

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
        <RevenueAddonApiClientContext.Provider value={value}>
            {children}
        </RevenueAddonApiClientContext.Provider>
    )
}

export const useRevenueAddonApi = (): UseRevenueAddonApiInterface => {
    const {isReady, client} = useContext(RevenueAddonApiClientContext)

    return {
        isReady,
        client,
    }
}
