import {Map} from 'immutable'
import axios from 'axios'
import {HelpCenter} from 'models/helpCenter/types'

import {
    createChatHelpCenterConfiguration,
    fetchChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {getHelpCenterList} from 'state/entities/helpCenter/helpCenters/selectors'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {NotificationStatus, Notification} from 'state/notifications/types'

export const useEnableArticleRecommendation = (
    notify: (message?: Notification) => Promise<unknown>
) => {
    const helpCenterList = useAppSelector(getHelpCenterList).filter(
        (helpCenter) => !helpCenter.deactivated_datetime
    )
    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return async (helpCenter: HelpCenter) => {
        if (!hasAutomationAddOn || helpCenterList.length > 0) {
            return
        }

        const chatHelpCenterConfigurationsPromises = chatIntegrations.map(
            async (chatIntegration: Map<any, any>) => {
                const areNotRelatedToSameShop =
                    !helpCenter.shop_name ||
                    helpCenter.shop_name !==
                        (chatIntegration.getIn(['meta', 'shop_name']) as string)

                if (areNotRelatedToSameShop) return

                const chatApplicationId: number = parseInt(
                    chatIntegration.getIn(['meta', 'app_id']) as string,
                    10
                )

                try {
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
                    return await createChatHelpCenterConfiguration({
                        helpCenterId: helpCenter.id,
                        chatApplicationId: chatApplicationId,
                    })
                } catch (err) {
                    console.error(err)
                }
            }
        )

        try {
            const chatHelpCenterConfigurations = await Promise.all(
                chatHelpCenterConfigurationsPromises.toJS()
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
