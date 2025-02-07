import {StoreConfiguration} from 'models/aiAgent/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {EnableAIAgentOnChatTask} from './tasks/EnableAIAgentOnChat.task'
import {EnableAIAgentOnEmailTask} from './tasks/EnableAIAgentOnEmail.task'

export type RuleEngineDataContext = {
    aiAgentStoreConfiguration: StoreConfiguration
}

export type RuleEngineRoutesContext = {
    aiAgentRoutes: ReturnType<typeof useAiAgentNavigation>['routes']
}

export const runRuleEngine = (
    data: RuleEngineDataContext,
    routes: RuleEngineRoutesContext
) => {
    const tasks = [
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
    ]
    const completedTasks = tasks.filter((task) => !task.display)
    const pendingTasks = tasks.filter((task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
