import type { ChatIntegrationsStatusData } from '../useFetchChatIntegrationsStatusData'

type AllKeys = keyof ChatIntegrationsStatusDataFixture
type ConfiguredChatIntegrationsStatusData<
    ToKeepFunctions extends keyof ChatIntegrationsStatusDataFixture,
> = Omit<ChatIntegrationsStatusDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type ChatIntegrationsStatusDataFullyConfigured =
    ConfiguredChatIntegrationsStatusData<'build'>

type InternalData = {
    chatIntegrationId: number
}
export class ChatIntegrationsStatusDataFixture {
    private chatIntegrationsStatusData: ChatIntegrationsStatusData
    private internalData: InternalData = {
        chatIntegrationId: 1,
    }

    private constructor() {
        this.chatIntegrationsStatusData = []
    }

    static start() {
        return new ChatIntegrationsStatusDataFixture() as ConfiguredChatIntegrationsStatusData<
            'withoutChatIntegrationStatus' | 'withChatIntegrationStatus'
        >
    }

    withoutChatIntegrationStatus() {
        this.chatIntegrationsStatusData = []
        return this as ChatIntegrationsStatusDataFullyConfigured
    }

    withChatIntegrationStatus({ isInstalled = false } = {}) {
        const id = this.internalData.chatIntegrationId++
        this.chatIntegrationsStatusData.push({
            installed: isInstalled,
            applicationId: id,
            chatId: id,
        } as ChatIntegrationsStatusData[number])

        return this as ConfiguredChatIntegrationsStatusData<
            'withChatIntegrationStatus' | 'build'
        >
    }

    build(): ChatIntegrationsStatusData {
        return this.chatIntegrationsStatusData
    }
}
