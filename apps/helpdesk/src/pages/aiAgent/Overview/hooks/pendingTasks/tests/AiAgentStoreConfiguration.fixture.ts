import type { AiAgentScope } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'

import type { AiAgentStoreConfigurationData } from '../useFetchAiAgentStoreConfigurationData'

type AllKeys = keyof AiAgentStoreConfigurationFixture
type ConfiguredAiAgentStoreConfigurationFixture<
    ToKeepFunctions extends keyof AiAgentStoreConfigurationFixture,
> = Omit<AiAgentStoreConfigurationFixture, Exclude<AllKeys, ToKeepFunctions>>

export type AiAgentStoreConfigurationFixtureFullyConfigured =
    ConfiguredAiAgentStoreConfigurationFixture<'build'>

export class AiAgentStoreConfigurationFixture {
    private readonly aiAgentStoreConfigurationData: AiAgentStoreConfigurationData

    private constructor() {
        this.aiAgentStoreConfigurationData = {
            emailChannelDeactivatedDatetime: '2021-01-01T00:00:00Z',
            chatChannelDeactivatedDatetime: '2021-01-01T00:00:00Z',
        } as Partial<AiAgentStoreConfigurationData> as any
    }

    static start() {
        return new AiAgentStoreConfigurationFixture() as ConfiguredAiAgentStoreConfigurationFixture<
            | 'withConnectedHelpCenter'
            | 'withoutConnectedHelpCenter'
            | 'withScopes'
            | 'withConnectedEmailIntegrations'
            | 'withoutConnectedEmailIntegrations'
            | 'withConnectedChatIntegrations'
            | 'withoutConnectedChatIntegrations'
            | 'withCreatedDatetime'
            | 'withDiscountLevelStrategy'
            | 'withoutDiscountLevelStrategy'
            | 'withFloatingChatInputConfiguration'
            | 'withoutFloatingChatInputConfiguration'
            | 'withSuggestedProductQuestions'
            | 'withoutSuggestedProductQuestions'
            | 'withTriggerOnSearch'
            | 'withoutTriggerOnSearch'
        >
    }

    withConnectedEmailIntegrations(...ids: { id: number; email: string }[]) {
        this.aiAgentStoreConfigurationData.monitoredEmailIntegrations = ids
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedHelpCenter'
                | 'withoutConnectedHelpCenter'
                | 'withScopes'
                | 'withCreatedDatetime'
            >
    }

    withoutConnectedEmailIntegrations() {
        this.aiAgentStoreConfigurationData.monitoredEmailIntegrations = []
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedHelpCenter'
                | 'withoutConnectedHelpCenter'
                | 'withScopes'
                | 'withCreatedDatetime'
            >
    }

    withConnectedChatIntegrations(ids: number[]) {
        this.aiAgentStoreConfigurationData.monitoredChatIntegrations = ids
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withConnectedEmailIntegrations'
                | 'withoutConnectedEmailIntegrations'
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedHelpCenter'
                | 'withoutConnectedHelpCenter'
                | 'withScopes'
                | 'withCreatedDatetime'
            >
    }

    withoutConnectedChatIntegrations() {
        this.aiAgentStoreConfigurationData.monitoredChatIntegrations = []
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withConnectedEmailIntegrations'
                | 'withoutConnectedEmailIntegrations'
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedHelpCenter'
                | 'withoutConnectedHelpCenter'
                | 'withScopes'
                | 'withCreatedDatetime'
            >
    }

    withConnectedHelpCenter(helpCenterId: number) {
        this.aiAgentStoreConfigurationData.helpCenterId = helpCenterId
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedEmailIntegrations'
                | 'withoutConnectedEmailIntegrations'
                | 'withCreatedDatetime'
            >
    }

    withoutConnectedHelpCenter() {
        this.aiAgentStoreConfigurationData.helpCenterId = null
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withChatChannelEnabled'
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withConnectedEmailIntegrations'
                | 'withoutConnectedEmailIntegrations'
                | 'withCreatedDatetime'
            >
    }

    withChatChannelEnabled() {
        this.aiAgentStoreConfigurationData.chatChannelDeactivatedDatetime = null
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withEmailChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withCreatedDatetime'
            >
    }

    withEmailChannelEnabled() {
        this.aiAgentStoreConfigurationData.emailChannelDeactivatedDatetime =
            null
        return this as AiAgentStoreConfigurationFixtureFullyConfigured &
            ConfiguredAiAgentStoreConfigurationFixture<
                | 'withChatChannelEnabled'
                | 'withHandoverTopics'
                | 'withoutHandoverTopic'
                | 'withCreatedDatetime'
            >
    }

    withoutHandoverTopic() {
        this.aiAgentStoreConfigurationData.excludedTopics = []
        return this as AiAgentStoreConfigurationFixtureFullyConfigured
    }

    withHandoverTopics(...topics: string[]) {
        this.aiAgentStoreConfigurationData.excludedTopics = topics

        return this as AiAgentStoreConfigurationFixtureFullyConfigured
    }

    withoutDiscountLevelStrategy() {
        this.aiAgentStoreConfigurationData.salesDiscountStrategyLevel =
            DiscountStrategy.NoDiscount
        return this as AiAgentStoreConfigurationFixtureFullyConfigured
    }

    withDiscountLevelStrategy() {
        this.aiAgentStoreConfigurationData.salesDiscountStrategyLevel =
            DiscountStrategy.Balanced

        return this as AiAgentStoreConfigurationFixtureFullyConfigured
    }

    withFloatingChatInputConfiguration(scopes: AiAgentScope[]) {
        this.aiAgentStoreConfigurationData.scopes = scopes
        this.aiAgentStoreConfigurationData.floatingChatInputConfiguration = {
            isEnabled: true,
        }
        return this
    }

    withoutFloatingChatInputConfiguration(scopes: AiAgentScope[]) {
        this.aiAgentStoreConfigurationData.scopes = scopes
        this.aiAgentStoreConfigurationData.floatingChatInputConfiguration = {
            isEnabled: false,
        }
        return this
    }

    withTriggerOnSearch() {
        this.aiAgentStoreConfigurationData.isSalesHelpOnSearchEnabled = true
        return this
    }

    withoutTriggerOnSearch() {
        this.aiAgentStoreConfigurationData.isSalesHelpOnSearchEnabled = false
        return this
    }

    withSuggestedProductQuestions() {
        this.aiAgentStoreConfigurationData.isConversationStartersEnabled = true
        this.aiAgentStoreConfigurationData.isConversationStartersDesktopOnly = false
        return this
    }

    withoutSuggestedProductQuestions() {
        this.aiAgentStoreConfigurationData.isConversationStartersEnabled = false
        this.aiAgentStoreConfigurationData.isConversationStartersDesktopOnly = false
        return this
    }

    withScopes(scopes: AiAgentScope[]) {
        this.aiAgentStoreConfigurationData.scopes = scopes
        return this as ConfiguredAiAgentStoreConfigurationFixture<
            | 'withConnectedHelpCenter'
            | 'withoutConnectedHelpCenter'
            | 'withChatChannelEnabled'
            | 'withEmailChannelEnabled'
            | 'build'
        >
    }

    withCreatedDatetime(createdDatetime: string) {
        this.aiAgentStoreConfigurationData.createdDatetime = createdDatetime
        return this
    }

    build(): AiAgentStoreConfigurationData {
        return this.aiAgentStoreConfigurationData
    }
}
