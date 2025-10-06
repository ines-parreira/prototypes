import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableAIAgentOnEmailBody,
    EnableAskAnythingBody,
    EnableSuggestedProductsBody,
    EnableTriggerOnSearchBody,
    MonitorAiAgentBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/SetupTaskBodies'
import {
    TaskConfigTemplate,
    TasksCategory,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { CreateAnActionTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/CreateAnAction.task'
import { EnableAIAgentOnChatTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableAIAgentOnChat.task'
import { EnableAIAgentOnEmailTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableAIAgentOnEmail.task'
import { EnableAskAnythingInputTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableAskAnythingInput.task'
import { EnableSuggestedProductQuestionsTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableSuggestedProductQuestions.task'
import { EnableTriggerOnSearchTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/EnableTriggerOnSearch.task'
import { GiveFeedbackAIAgentTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/GiveFeedbackAIAgent.task'
import { UpdateShopifyPermissionsTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/UpdateShopifyPermissions.task'
import { VerifyYourEmailDomainTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/VerifyYourEmailDomain.task'

export const RULE_ENGINE_TASK_TO_STEP_NAME = new Map([
    [VerifyYourEmailDomainTask.name, StepName.VERIFY_EMAIL_DOMAIN],
    [UpdateShopifyPermissionsTask.name, StepName.UPDATE_SHOPIFY_PERMISSIONS],
    [EnableTriggerOnSearchTask.name, StepName.ENABLE_TRIGGER_ON_SEARCH],
    [
        EnableSuggestedProductQuestionsTask.name,
        StepName.ENABLE_SUGGESTED_PRODUCTS,
    ],
    [EnableAskAnythingInputTask.name, StepName.ENABLE_ASK_ANYTHING],
    [CreateAnActionTask.name, StepName.CREATE_AN_ACTION],
    [GiveFeedbackAIAgentTask.name, StepName.REVIEW_AI_AGENT_INTERACTIONS],
    [EnableAIAgentOnChatTask.name, StepName.ENABLE_AI_AGENT_ON_CHAT],
    [EnableAIAgentOnEmailTask.name, StepName.ENABLE_AI_AGENT_ON_EMAIL],
])

export const TASK_CONFIG_TEMPLATES: Record<
    TasksCategory,
    TaskConfigTemplate[]
> = {
    [TasksCategory.Essential]: [
        {
            stepName: StepName.VERIFY_EMAIL_DOMAIN,
            displayName: 'Verify your email domain',
            bodyComponent: VerifyEmailDomainBody,
        },
        {
            stepName: StepName.UPDATE_SHOPIFY_PERMISSIONS,
            displayName: 'Update Shopify permissions',
            bodyComponent: UpdateShopifyPermissionsBody,
        },
    ],
    [TasksCategory.Customize]: [
        {
            stepName: StepName.ENABLE_TRIGGER_ON_SEARCH,
            displayName: `Enable 'Trigger on Search'`,
            bodyComponent: EnableTriggerOnSearchBody,
        },
        {
            stepName: StepName.ENABLE_SUGGESTED_PRODUCTS,
            displayName: `Enable 'Suggested product questions'`,
            bodyComponent: EnableSuggestedProductsBody,
        },
        {
            stepName: StepName.ENABLE_ASK_ANYTHING,
            displayName: `Enable 'Ask anything input'`,
            bodyComponent: EnableAskAnythingBody,
        },
    ],
    [TasksCategory.Train]: [
        {
            stepName: StepName.CREATE_AN_ACTION,
            displayName: 'Create an Action',
            bodyComponent: CreateAnActionBody,
        },
        {
            stepName: StepName.REVIEW_AI_AGENT_INTERACTIONS,
            displayName: 'Review AI Agent interactions',
            bodyComponent: MonitorAiAgentBody,
        },
    ],
    [TasksCategory.Deploy]: [
        {
            stepName: StepName.ENABLE_AI_AGENT_ON_CHAT,
            displayName: 'Enable AI Agent on chat',
            bodyComponent: EnableAIAgentOnChatBody,
        },
        {
            stepName: StepName.ENABLE_AI_AGENT_ON_EMAIL,
            displayName: 'Enable AI Agent on email',
            bodyComponent: EnableAIAgentOnEmailBody,
        },
    ],
}
