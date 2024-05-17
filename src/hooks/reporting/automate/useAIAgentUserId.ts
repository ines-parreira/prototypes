import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {
    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS,
    getHumanAndAutomationBotAgentsJS,
} from 'state/agents/selectors'
import {UserRole} from 'config/types/user'

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
