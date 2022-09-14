import axios from 'axios'
import {HelpCenter} from 'models/helpCenter/types'

import {
    createChatHelpCenterConfiguration,
    fetchChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

import useAppSelector from 'hooks/useAppSelector'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {getHelpCenterList} from 'state/entities/helpCenter/helpCenters/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {NotificationStatus, Notification} from 'state/notifications/types'

export const useEnableArticleRecommendation = (
    notify: (message?: Notification) => Promise<unknown>
) => {
    const helpCenterList = useAppSelector(getHelpCenterList).filter(
        (helpCenter) => !helpCenter.deactivated_datetime
    )
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return async (newHelpCenter: HelpCenter) => {
        const hasHelpCenterWithSameStore = helpCenterList.find(
            (helpCenter) => helpCenter.shop_name === newHelpCenter.shop_name
        )

        if (
            !hasAutomationAddOn ||
            !newHelpCenter.shop_name ||
            hasHelpCenterWithSameStore
        ) {
            return
        }

        const chatHelpCenterConfigurationsPromises = chatIntegrations.map(
            async (chatIntegration) => {
                const areNotRelatedToSameShop =
                    newHelpCenter.shop_name !== chatIntegration.meta.shop_name

                if (areNotRelatedToSameShop) return

                const chatApplicationId = chatIntegration.meta.app_id
                    ? parseInt(chatIntegration.meta.app_id, 10)
                    : null

                try {
                    if (!chatApplicationId) {
                        throw Error('Chat Application ID is not defined')
                    }

                    const chatHelpCenterConfiguration =
                        await fetchChatHelpCenterConfiguration(
                            chatApplicationId
                        )
                    if (chatHelpCenterConfiguration) {
                        return
                    }
                } catch (err) {
                    if (
                        !axios.isAxiosError(err) ||
                        err.response?.status !== 404
                    ) {
                        console.error(err)
                        return
                    }
                }

                try {
                    if (!chatApplicationId) {
                        throw Error('Chat Application ID is not defined')
                    }

                    return await createChatHelpCenterConfiguration({
                        helpCenterId: newHelpCenter.id,
                        chatApplicationId: chatApplicationId,
                    })
                } catch (err) {
                    console.error(err)
                }
            }
        )

        try {
            const chatHelpCenterConfigurations = await Promise.all(
                chatHelpCenterConfigurationsPromises
            )
            const chatHelpCenterConfigurationsCount =
                chatHelpCenterConfigurations.filter((e) => e).length
            if (chatHelpCenterConfigurationsCount > 0) {
                void notify({
                    message: `Activated the article recommendation for ${chatHelpCenterConfigurationsCount} chat ${
                        chatHelpCenterConfigurationsCount > 1
                            ? 'integrations'
                            : 'integration'
                    }`,
                    status: NotificationStatus.Success,
                })
            }
            return
        } catch (err) {
            console.error(err)
        }
    }
}
