import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'
import {UserRole} from 'config/types/user'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'

export const useAIAgentUserId = (): string | undefined => {
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)

    const aiAgentUserId = useMemo(
        () =>
            agents
                .find(
                    (agent) =>
                        agent.role.name === UserRole.Bot &&
                        agent.email === AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS
                )
                ?.id?.toString(),
        [agents]
    )

    return aiAgentUserId
}
