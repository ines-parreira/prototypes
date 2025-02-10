import {AiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'

type AllKeys = keyof AiAgentStoreConfigurationFixture
type ConfiguredAiAgentStoreConfigurationFixture<
    ToKeepFunctions extends keyof AiAgentStoreConfigurationFixture,
> = Omit<AiAgentStoreConfigurationFixture, Exclude<AllKeys, ToKeepFunctions>>

export type AiAgentStoreConfigurationFixtureFullyConfigured =
    ConfiguredAiAgentStoreConfigurationFixture<'build'>

export class AiAgentStoreConfigurationFixture {
    private aiAgentStoreConfigurationData: AiAgentStoreConfigurationData

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
            | 'withChatChannelEnabled'
            | 'withEmailChannelEnabled'
        >
    }

    withConnectedHelpCenter(helpCenterId: number) {
        this.aiAgentStoreConfigurationData.helpCenterId = helpCenterId
        return this as ConfiguredAiAgentStoreConfigurationFixture<
            'withChatChannelEnabled' | 'withEmailChannelEnabled' | 'build'
        >
    }

    withoutConnectedHelpCenter() {
        this.aiAgentStoreConfigurationData.helpCenterId = null
        return this as ConfiguredAiAgentStoreConfigurationFixture<
            'withChatChannelEnabled' | 'withEmailChannelEnabled' | 'build'
        >
    }

    withChatChannelEnabled() {
        this.aiAgentStoreConfigurationData.chatChannelDeactivatedDatetime = null
        return this as ConfiguredAiAgentStoreConfigurationFixture<
            'withEmailChannelEnabled' | 'build'
        >
    }

    withEmailChannelEnabled() {
        this.aiAgentStoreConfigurationData.emailChannelDeactivatedDatetime =
            null
        return this as ConfiguredAiAgentStoreConfigurationFixture<
            'withChatChannelEnabled' | 'build'
        >
    }

    build(): AiAgentStoreConfigurationData {
        return this.aiAgentStoreConfigurationData
    }
}
