import {useMemo} from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'

export const useAIAgentUserId = (): string | undefined => {
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)

    const aiAgentUserId = useMemo(
        () =>
            agents
                .find(
                    (agent) =>
                        agent.role.name === UserRole.Bot &&
                        AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(
                            agent.email
                        )
                )
                ?.id?.toString(),
        [agents]
    )

    return aiAgentUserId
}
