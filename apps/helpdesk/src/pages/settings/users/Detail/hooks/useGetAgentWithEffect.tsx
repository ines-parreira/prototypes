import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'

import { UserRole } from 'config/types/user'
import { handleError } from 'hooks/agents/errorHandler'
import { useGetAgent } from 'models/agents/queries'
import type { StoreDispatch } from 'state/types'

export const useGetAgentWithEffects = ({
    agentId,
    isEdit,
    setAgentState,
    set2FA,
    dispatch,
}: {
    agentId: number
    isEdit: boolean
    setAgentState: Dispatch<
        SetStateAction<{ name: string; email: string; role: UserRole }>
    >
    set2FA: Dispatch<SetStateAction<boolean | undefined>>
    dispatch: StoreDispatch
}) => {
    const {
        data: agent,
        isLoading,
        error,
    } = useGetAgent(agentId, {
        enabled: isEdit,
    })

    useEffect(() => {
        if (error) {
            handleError(
                error,
                `Failed to fetch agent with id ${agentId}`,
                dispatch,
            )
        } else {
            setAgentState({
                name: agent?.name || '',
                email: agent?.email || '',
                role: agent?.role?.name || UserRole.BasicAgent,
            })
            // the 2FA modal does not reset agent queries so local state
            // needs to have priority over the query 2FA value
            set2FA((has2FA) =>
                has2FA === undefined ? agent?.has_2fa_enabled : has2FA,
            )
        }
    }, [agent, error, agentId, setAgentState, set2FA, dispatch])

    return { rawData: agent, isLoading }
}
