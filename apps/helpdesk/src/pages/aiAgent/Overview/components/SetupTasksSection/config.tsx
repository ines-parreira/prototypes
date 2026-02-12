import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableAIAgentOnEmailBody,
    EnableAskAnythingBody,
    MonitorAiAgentBody,
    PrepareSuggestedProductsBody,
    PrepareTriggerOnSearchBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/SetupTaskBodies'
import type { TaskConfigTemplate } from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { TasksCategory } from 'pages/aiAgent/Overview/components/SetupTasksSection/types'

export const RULE_ENGINE_TASK_TO_STEP_NAME = new Map([
    ['VerifyYourEmailDomainTask', StepName.VERIFY_EMAIL_DOMAIN],
    [
        'UpdateShopifyPermissionsRedirectTask',
        StepName.UPDATE_SHOPIFY_PERMISSIONS,
    ],
    ['PrepareTriggerOnSearchTask', StepName.ENABLE_TRIGGER_ON_SEARCH],
    [
        'PrepareSuggestedProductQuestionsTask',
        StepName.ENABLE_SUGGESTED_PRODUCTS,
    ],
    ['PrepareAskAnythingInputTask', StepName.ENABLE_ASK_ANYTHING],
    ['CreateAnActionTask', StepName.CREATE_AN_ACTION],
    ['ReviewAIAgentInteractionsTask', StepName.REVIEW_AI_AGENT_INTERACTIONS],
    ['EnableAIAgentOnChatTask', StepName.ENABLE_AI_AGENT_ON_CHAT],
    ['EnableAIAgentOnEmailTask', StepName.ENABLE_AI_AGENT_ON_EMAIL],
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
    [TasksCategory.Train]: [
        {
            stepName: StepName.REVIEW_AI_AGENT_INTERACTIONS,
            displayName: 'Review AI Agent interactions',
            bodyComponent: MonitorAiAgentBody,
        },
        {
            stepName: StepName.CREATE_AN_ACTION,
            displayName: 'Create an Action',
            bodyComponent: CreateAnActionBody,
        },
    ],
    [TasksCategory.Customize]: [
        {
            stepName: StepName.ENABLE_TRIGGER_ON_SEARCH,
            displayName: `Turn on 'Search assist' to boost conversion by 25%`,
            bodyComponent: PrepareTriggerOnSearchBody,
        },
        {
            stepName: StepName.ENABLE_SUGGESTED_PRODUCTS,
            displayName: `Turn on 'AI FAQs: Floating above chat' to reduce buying friction`,
            bodyComponent: PrepareSuggestedProductsBody,
        },
        {
            stepName: StepName.ENABLE_ASK_ANYTHING,
            displayName: `Turn on 'Ask anything' to reduce shopper drop-off`,
            bodyComponent: EnableAskAnythingBody,
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
