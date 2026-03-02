import type { KnowledgeStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import type { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { EnableAskAnythingInputTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableAskAnythingInput.task'
import { GiveFeedbackAIAgentTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/GiveFeedbackAIAgent.task'
import { SetUpYourEmailTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/SetUpYourEmail.task'
import type { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'
import { UpdateShopifyPermissionsTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/UpdateShopifyPermissions.task'
import type { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { getAiAgentTypeFromScopes } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ConnectAHelpCenterTask } from './tasks/ConnectAHelpCenter.task'
import { ConnectYourDefaultEmailTask } from './tasks/ConnectYourDefaultEmail.task'
import { Create3to5GuidancesTask } from './tasks/Create3to5Guidances.task'
import { CreateAnActionTask } from './tasks/CreateAnAction.task'
import { CreateYourFirstGuidanceTask } from './tasks/CreateYourFirstGuidance.task'
import { EnableAIAgentOnChatTask } from './tasks/EnableAIAgentOnChat.task'
import { EnableAIAgentOnEmailTask } from './tasks/EnableAIAgentOnEmail.task'
import { EnableSalesSkill } from './tasks/EnableSalesSkill'
import { EnableSuggestedProductQuestionsTask } from './tasks/EnableSuggestedProductQuestions.task'
import { EnableTriggerOnSearchTask } from './tasks/EnableTriggerOnSearch.task'
import { InstallYourChatTask } from './tasks/InstallYourChat.task'
import { PrepareAskAnythingInputTask } from './tasks/PrepareAskAnythingInput.task'
import { PrepareSuggestedProductQuestionsTask } from './tasks/PrepareSuggestedProductQuestions.task'
import { PrepareTriggerOnSearchTask } from './tasks/PrepareTriggerOnSearch.task'
import { PublishYourFirstGuidanceTask } from './tasks/PublishYourFirstGuidance.task'
import { ReviewAIAgentInteractionsTask } from './tasks/ReviewAIAgentInteractions.task'
import { ReviewAIGeneratedGuidancesTask } from './tasks/ReviewAIGeneratedGuidances.task'
import { SelectYourChatTask } from './tasks/SelectYourChat.task'
import { SetYourActionsLiveTask } from './tasks/SetYourActionsLive.task'
import { TestAIAgentTask } from './tasks/TestAIAgent.task'
import { UpdateShopifyPermissionsRedirectTask } from './tasks/UpdateShopifyPermissionsRedirect.task'
import { UpdateYourChatInstallationTask } from './tasks/UpdateYourChatInstallation.task'
import { UpdateYourDiscountStrategyTask } from './tasks/UpdateYourDiscountStrategy.task'
import { UploadAnExternalDocTask } from './tasks/UploadAnExternalDoc.task'
import { VerifyYourEmailDomainTask } from './tasks/VerifyYourEmailDomain.task'
import type { ActionsData } from './useFetchActionsData'
import type { AiAgentPlaygroundExecutionsData } from './useFetchAiAgentPlaygroundExecutionsData'
import type { AiAgentStoreConfigurationData } from './useFetchAiAgentStoreConfigurationData'
import type { ChatIntegrationsStatusData } from './useFetchChatIntegrationsStatusData'
import type { EmailIntegrationsData } from './useFetchEmailIntegrationsData'
import type { FaqHelpCentersData } from './useFetchFaqHelpCentersData'
import type { FileIngestionData } from './useFetchFileIngestionData'
import type { GuidancesData } from './useFetchGuidancesData'
import type { PageInteractionsData } from './useFetchPageInteractionsData'
import type { ShopifyPermissionsData } from './useShopifyPermissionsData'
import type { TicketViewData } from './useTicketViewData'

export type RuleEngineData = {
    aiAgentStoreConfiguration: AiAgentStoreConfigurationData
    faqHelpCenters?: FaqHelpCentersData
    storeKnowledgeStatus?: KnowledgeStatus
    fileIngestion?: FileIngestionData
    guidances?: GuidancesData
    actions?: ActionsData
    aiAgentPlaygroundExecutions?: AiAgentPlaygroundExecutionsData
    emailIntegrations?: EmailIntegrationsData
    alreadyUsedEmailIntegrationsIds?: number[]
    shopifyIntegration?: ShopifyPermissionsData
    chatIntegrationsStatus?: ChatIntegrationsStatusData
    selfServiceChatChannels: SelfServiceChatChannel[]
    ticketView?: TicketViewData
    ticketToReviewViewData?: TicketViewData
    pageInteractions: PageInteractionsData | null
    isActivationEnabled: boolean
    isAiShoppingAssistantEnabled: boolean
    isStandaloneMerchant?: boolean
    isTriggerOnSearchDisabled?: boolean
}

export type RuleEngineRoutes = {
    aiAgentRoutes: ReturnType<typeof useAiAgentNavigation>['routes']
}

const tasksPerAiAgentType: Record<
    AiAgentType,
    (data: RuleEngineData, routes: RuleEngineRoutes) => Task[]
> = {
    mixed: (data: RuleEngineData, routes: RuleEngineRoutes) => [
        new SelectYourChatTask(data, routes),
        new InstallYourChatTask(data, routes),
        new UpdateYourChatInstallationTask(data, routes),
        new SetUpYourEmailTask(data, routes),
        new UpdateShopifyPermissionsTask(data, routes),
        new ConnectYourDefaultEmailTask(data, routes),
        new VerifyYourEmailDomainTask(data, routes),
        new ConnectAHelpCenterTask(data, routes),
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
        new ReviewAIGeneratedGuidancesTask(data, routes),
        new CreateYourFirstGuidanceTask(data, routes),
        new PublishYourFirstGuidanceTask(data, routes),
        new Create3to5GuidancesTask(data, routes),
        new UploadAnExternalDocTask(data, routes),
        new TestAIAgentTask(data, routes),
        new CreateAnActionTask(data, routes),
        new SetYourActionsLiveTask(data, routes),
        new GiveFeedbackAIAgentTask(data, routes),
        new UpdateYourDiscountStrategyTask(data, routes),
        new EnableAskAnythingInputTask(data, routes),
        new EnableTriggerOnSearchTask(data, routes),
        new EnableSuggestedProductQuestionsTask(data, routes),
    ],
    sales: (data: RuleEngineData, routes: RuleEngineRoutes) => [
        new SelectYourChatTask(data, routes),
        new InstallYourChatTask(data, routes),
        new UpdateYourChatInstallationTask(data, routes),
        new UpdateShopifyPermissionsTask(data, routes),
        new ConnectAHelpCenterTask(data, routes),
        new EnableAIAgentOnChatTask(data, routes),
        new ReviewAIGeneratedGuidancesTask(data, routes),
        new CreateYourFirstGuidanceTask(data, routes),
        new PublishYourFirstGuidanceTask(data, routes),
        new Create3to5GuidancesTask(data, routes),
        new UploadAnExternalDocTask(data, routes),
        new TestAIAgentTask(data, routes),
        new GiveFeedbackAIAgentTask(data, routes),
        new UpdateYourDiscountStrategyTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
    ],
    support: (data: RuleEngineData, routes: RuleEngineRoutes) => [
        new SetUpYourEmailTask(data, routes),
        new SelectYourChatTask(data, routes),
        new InstallYourChatTask(data, routes),
        new ConnectYourDefaultEmailTask(data, routes),
        new UpdateShopifyPermissionsTask(data, routes),
        new VerifyYourEmailDomainTask(data, routes),
        new ConnectAHelpCenterTask(data, routes),
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
        new EnableSalesSkill(data, routes),
        new ReviewAIGeneratedGuidancesTask(data, routes),
        new CreateYourFirstGuidanceTask(data, routes),
        new PublishYourFirstGuidanceTask(data, routes),
        new Create3to5GuidancesTask(data, routes),
        new UploadAnExternalDocTask(data, routes),
        new TestAIAgentTask(data, routes),
        new CreateAnActionTask(data, routes),
        new SetYourActionsLiveTask(data, routes),
        new GiveFeedbackAIAgentTask(data, routes),
    ],
    overview: (data: RuleEngineData, routes: RuleEngineRoutes) => [
        new VerifyYourEmailDomainTask(data, routes),
        new UpdateShopifyPermissionsRedirectTask(data, routes),
        new CreateAnActionTask(data, routes),
        new ReviewAIAgentInteractionsTask(data, routes),
        new PrepareTriggerOnSearchTask(data, routes),
        new PrepareSuggestedProductQuestionsTask(data, routes),
        new PrepareAskAnythingInputTask(data, routes),
        new EnableAIAgentOnChatTask(data, routes),
        new EnableAIAgentOnEmailTask(data, routes),
    ],
}

export const runRuleEngine = (
    data: RuleEngineData,
    routes: RuleEngineRoutes,
    additionalScope?: AiAgentType,
) => {
    const aiAgentType = additionalScope
        ? additionalScope
        : getAiAgentTypeFromScopes(data.aiAgentStoreConfiguration.scopes)

    const tasks = aiAgentType
        ? tasksPerAiAgentType[aiAgentType](data, routes).filter(
              (task: Task) => task.available,
          )
        : []

    const completedTasks = tasks.filter((task: Task) => !task.display)
    const pendingTasks = tasks.filter((task: Task) => task.display)

    return {
        completedTasks,
        pendingTasks,
    }
}
