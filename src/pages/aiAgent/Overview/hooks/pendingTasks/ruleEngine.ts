import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {ConnectAHelpCenterTask} from './tasks/ConnectAHelpCenter.task'
import {CreateYourFirstGuidanceTask} from './tasks/CreateYourFirstGuidance.task'
import {EnableAIAgentOnChatTask} from './tasks/EnableAIAgentOnChat.task'
import {EnableAIAgentOnEmailTask} from './tasks/EnableAIAgentOnEmail.task'
import {PublishYourFirstGuidanceTask} from './tasks/PublishYourFirstGuidance.task'
import {UploadAnExternalDocTask} from './tasks/UploadAnExternalDoc.task'
import {type AiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {type FaqHelpCentersData} from './useFetchFaqHelpCentersData'
import {type FileIngestionData} from './useFetchFileIngestionData'
import {GuidancesData} from './useFetchGuidancesData'

export type RuleEngineData = {
    aiAgentStoreConfiguration: AiAgentStoreConfigurationData
    faqHelpCenters: FaqHelpCentersData
    fileIngestion: FileIngestionData
    guidances: GuidancesData
}

export type RuleEngineRoutes = {
    aiAgentRoutes: ReturnType<typeof useAiAgentNavigation>['routes']
}

export const runRuleEngine = (
    data: RuleEngineData,
    routes: RuleEngineRoutes
) => {
    const tasks = [
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
        new ConnectAHelpCenterTask(data, routes),
        new UploadAnExternalDocTask(data, routes),
        new CreateYourFirstGuidanceTask(data, routes),
        new PublishYourFirstGuidanceTask(data, routes),
    ]
    const completedTasks = tasks.filter((task) => !task.display)
    const pendingTasks = tasks.filter((task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
