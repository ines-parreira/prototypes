import {HelpCenter} from 'models/helpCenter/types'

import {fetchSelfServiceConfigurationSSP} from 'models/selfServiceConfiguration/resources'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {getHasAutomate} from 'state/billing/selectors'
import {getHelpCenterList} from 'state/entities/helpCenter/helpCenters/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'

export const useEnableArticleRecommendation = () => {
    const helpCenterList = useAppSelector(getHelpCenterList).filter(
        (helpCenter) => !helpCenter.deactivated_datetime
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )
    const dispatch = useAppDispatch()

    const {handleSelfServiceConfigurationUpdate} =
        useSelfServiceConfigurationUpdate({
            handleNotify: (notification) => {
                if (
                    notification.status === NotificationStatus.Error &&
                    notification.message
                ) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: notification.message,
                        })
                    )
                }
            },
        })

    return async (newHelpCenter: HelpCenter) => {
        const hasHelpCenterWithSameStore = helpCenterList.find(
            (helpCenter) => helpCenter.shop_name === newHelpCenter.shop_name
        )

        if (
            !hasAutomate ||
            !newHelpCenter.shop_name ||
            hasHelpCenterWithSameStore
        ) {
            return
        }

        const shopifyIntegration = shopifyIntegrations.find(
            (shopifyIntegration) =>
                shopifyIntegration.meta.shop_name === newHelpCenter.shop_name
        )

        if (!shopifyIntegration) {
            return
        }

        try {
            const res = await fetchSelfServiceConfigurationSSP(
                shopifyIntegration.name,
                shopifyIntegration.type
            )

            if (res.articleRecommendationHelpCenterId) {
                return
            }

            return await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.articleRecommendationHelpCenterId = newHelpCenter.id
                },
                {},
                shopifyIntegration.id
            )
        } catch (err) {
            console.error(err)
        }
    }
}
