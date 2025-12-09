import { useMemo } from 'react'

import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

const EMAIL_CHANNEL = 'email'
const CHAT_CHANNEL = 'chat'
const SMS_CHANNEL = 'sms'
export const useGetAiAgentIntegrations = () => {
    const aiAgentConfig = useAiAgentStoreConfigurationContext()

    return useMemo(() => {
        const emailIntegrations =
            aiAgentConfig.storeConfiguration?.monitoredEmailIntegrations?.map(
                (integration) => {
                    return {
                        id: integration.id,
                        channel: EMAIL_CHANNEL,
                    }
                },
            ) || []
        const chatIntegrations =
            aiAgentConfig.storeConfiguration?.monitoredChatIntegrations?.map(
                (id) => {
                    return {
                        id: id,
                        channel: CHAT_CHANNEL,
                    }
                },
            ) || []

        const smsIntegrations =
            aiAgentConfig.storeConfiguration?.monitoredSmsIntegrations?.map(
                (id) => {
                    return {
                        id: id,
                        channel: SMS_CHANNEL,
                    }
                },
            ) || []

        return [...emailIntegrations, ...chatIntegrations, ...smsIntegrations]
    }, [aiAgentConfig])
}
