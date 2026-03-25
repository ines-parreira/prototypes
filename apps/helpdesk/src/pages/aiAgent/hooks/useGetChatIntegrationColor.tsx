import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export const useGetChatIntegrationColor = ({
    shopName,
    chatIntegrationIds = [],
}: {
    shopName: string
    chatIntegrationIds?: number[]
}) => {
    const chatIntegrations = useSelfServiceChatChannels(
        SHOPIFY_INTEGRATION_TYPE,
        shopName,
    )

    const chatIntegration = chatIntegrations.find((chatIntegration) =>
        chatIntegrationIds?.includes(chatIntegration.value.id),
    )

    return {
        mainColor: chatIntegration?.value.decoration.main_color,
        conversationColor: chatIntegration?.value.decoration.conversation_color,
    }
}
