import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {ConnectAHelpCenterTask} from './tasks/ConnectAHelpCenter.task'
import {Create3to5GuidancesTask} from './tasks/Create3to5Guidances.task'
import {CreateAnActionTask} from './tasks/CreateAnAction.task'
import {CreateYourFirstGuidanceTask} from './tasks/CreateYourFirstGuidance.task'
import {EnableAIAgentOnChatTask} from './tasks/EnableAIAgentOnChat.task'
import {EnableAIAgentOnEmailTask} from './tasks/EnableAIAgentOnEmail.task'
import {PublishYourFirstGuidanceTask} from './tasks/PublishYourFirstGuidance.task'
import {ReviewAIGeneratedGuidancesTask} from './tasks/ReviewAIGeneratedGuidances.task'
import {SetYourActionsLiveTask} from './tasks/SetYourActionsLive.task'
import {UploadAnExternalDocTask} from './tasks/UploadAnExternalDoc.task'

import {type ActionsData} from './useFetchActionsData'
import {type AiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {type FaqHelpCentersData} from './useFetchFaqHelpCentersData'
import {type FileIngestionData} from './useFetchFileIngestionData'
import {type GuidancesData} from './useFetchGuidancesData'

export type RuleEngineData = {
    aiAgentStoreConfiguration: AiAgentStoreConfigurationData
    faqHelpCenters: FaqHelpCentersData
    fileIngestion: FileIngestionData
    guidances: GuidancesData
    actions: ActionsData
}

export type RuleEngineRoutes = {
    aiAgentRoutes: ReturnType<typeof useAiAgentNavigation>['routes']
}

export const runRuleEngine = (
    data: RuleEngineData,
    routes: RuleEngineRoutes
) => {
    const tasks = [
        new ConnectAHelpCenterTask(data, routes),
        new Create3to5GuidancesTask(data, routes),
        new CreateAnActionTask(data, routes),
        new CreateYourFirstGuidanceTask(data, routes),
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
        new PublishYourFirstGuidanceTask(data, routes),
        new ReviewAIGeneratedGuidancesTask(data, routes),
        new SetYourActionsLiveTask(data, routes),
        new UploadAnExternalDocTask(data, routes),
    ]
    const completedTasks = tasks.filter((task) => !task.display)
    const pendingTasks = tasks.filter((task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
