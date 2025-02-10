import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {ConnectAHelpCenterTask} from './tasks/ConnectAHelpCenter.task'
import {EnableAIAgentOnChatTask} from './tasks/EnableAIAgentOnChat.task'
import {EnableAIAgentOnEmailTask} from './tasks/EnableAIAgentOnEmail.task'
import {UploadAnExternalDoc} from './tasks/UploadAnExternalDoc.task'
import {type AiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {type FileIngestionData} from './useFetchFileIngestionData'
import {type HelpCenterData} from './useFetchHelpCenterData'

export type RuleEngineDataContext = {
    aiAgentStoreConfiguration: AiAgentStoreConfigurationData
    helpCenters: HelpCenterData
    fileIngestion: FileIngestionData
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
        new UploadAnExternalDoc(data, routes),
    ]
    const completedTasks = tasks.filter((task) => !task.display)
    const pendingTasks = tasks.filter((task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
