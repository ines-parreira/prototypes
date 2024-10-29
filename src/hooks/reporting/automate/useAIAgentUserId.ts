import {useMemo} from 'react'

import {User, UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'

export const useAIAgentUser = (): User | undefined => {
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)

    return useMemo(
        () =>
            agents.find(
                (agent) =>
                    agent.role.name === UserRole.Bot &&
                    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(
                        agent.email
                    )
            ),
        [agents]
    )
}

export const useAIAgentUserId = (): string | undefined => {
    const aiAgentUser = useAIAgentUser()

    return aiAgentUser?.id?.toString()
}
