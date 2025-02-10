import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {ConnectAHelpCenterTask} from './tasks/ConnectAHelpCenter.task'
import {EnableAIAgentOnChatTask} from './tasks/EnableAIAgentOnChat.task'
import {EnableAIAgentOnEmailTask} from './tasks/EnableAIAgentOnEmail.task'
import {useFetchAiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {useFetchHelpCenterData} from './useFetchHelpCenterData'

export type RuleEngineDataContext = {
    aiAgentStoreConfiguration: Exclude<
        ReturnType<typeof useFetchAiAgentStoreConfigurationData>['data'],
        undefined
    >
    helpCenters: Exclude<
        ReturnType<typeof useFetchHelpCenterData>['data'],
        undefined
    >
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
        new ConnectAHelpCenterTask(data, routes),
    ]
    const completedTasks = tasks.filter((task) => !task.display)
    const pendingTasks = tasks.filter((task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
