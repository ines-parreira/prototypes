import type { ReactNode } from 'react'
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import type { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'
import { getRevenueAddonApiClient } from 'rest_api/revenue_addon_api/client'

type UseConvertApiInterface = {
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
        [state],
    )

    return (
        <RevenueAddonApiClientContext.Provider value={value}>
            {children}
        </RevenueAddonApiClientContext.Provider>
    )
}

export const useConvertApi = (): UseConvertApiInterface => {
    const { isReady, client } = useContext(RevenueAddonApiClientContext)

    return {
        isReady,
        client,
    }
}
