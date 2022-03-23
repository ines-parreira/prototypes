import {useMemo} from 'react'
import {
    GorgiasChatPositionAlignmentEnum,
    Integration,
    isGorgiasChatIntegration,
    isShopifyIntegration,
} from 'models/integration/types'
import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'

export const useChatIntegration = ({
    integrations,
    shopName,
}: {
    integrations: Integration[]
    shopName: string
}) => {
    const chatIntegration = useMemo(() => {
        const shopifyIntegration = integrations
            .filter(isShopifyIntegration)
            .find((integration) => {
                return integration.name === shopName
            })

        const foundIntegration = integrations
            .filter(isGorgiasChatIntegration)
            .find((integration) => {
                return (
                    integration.meta.shop_integration_id ===
                    shopifyIntegration?.id
                )
            })

        if (foundIntegration) {
            return foundIntegration
        }

        return {
            name: 'Chat',
            meta: {
                language: 'en-US',
            },
            decoration: {
                avatar_type: 'team-members',
                avatar_team_picture_url: '',
                introduction_text: 'How can we help?',
                main_color: GORGIAS_CHAT_DEFAULT_COLOR,
                position: {
                    offsetX: 0,
                    offsetY: 0,
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
                },
            },
        }
    }, [integrations, shopName])

    return {chatIntegration}
}
