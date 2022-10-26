import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useMemo,
} from 'react'
import {AppAbility} from 'rest_api/help_center_api/ability'

import {
    getHelpCenterClient,
    HelpCenterClient,
} from 'rest_api/help_center_api/index'

type UseHelpCenterApiInterface = {
    isReady: boolean
    client: HelpCenterClient | undefined
    agentAbility?: AppAbility
}

interface HelpCenterApiClientState {
    isReady: boolean
    client: HelpCenterClient | undefined
}

const HelpCenterApiClientContext = createContext<
    HelpCenterApiClientState & {agentAbility?: AppAbility}
>({
    isReady: false,
    client: undefined,
    agentAbility: undefined,
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

    const [agentAbility, setAgentAbility] = useState<AppAbility | undefined>(
        undefined
    )

    const initClient = async () => {
        const client = await getHelpCenterClient(setAgentAbility)

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
            agentAbility,
        }),
        [state, agentAbility]
    )

    return (
        <HelpCenterApiClientContext.Provider value={value}>
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

export const useAbilityChecker = () => {
    const {agentAbility} = useContext(HelpCenterApiClientContext)

    const isPassingRulesCheck = useCallback(
        (permissionChecker: (ab: AppAbility) => boolean | null) => {
            if (!agentAbility) return null
            return permissionChecker(agentAbility)
        },
        [agentAbility]
    )

    return {isPassingRulesCheck}
}
