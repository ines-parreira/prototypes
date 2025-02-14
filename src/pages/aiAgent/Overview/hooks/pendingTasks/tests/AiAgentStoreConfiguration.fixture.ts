import {AiAgentScope} from 'models/aiAgent/types'

import {AiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'

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
            | 'withCreatedDatetime'
        >
    }

    withConnectedEmailIntegrations(...ids: {id: number; email: string}[]) {
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
