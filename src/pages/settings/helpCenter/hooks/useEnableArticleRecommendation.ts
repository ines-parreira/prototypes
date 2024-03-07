import {HelpCenter} from 'models/helpCenter/types'

import {
    fetchSelfServiceConfiguration,
    updateSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/resources'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {getHasAutomate} from 'state/billing/selectors'
import {getHelpcenterListByTypes} from 'state/entities/helpCenter/helpCenters/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'

export const useEnableArticleRecommendation = () => {
    const helpCenterList = useAppSelector(
        getHelpcenterListByTypes(['faq'])
    ).filter((helpCenter) => !helpCenter.deactivated_datetime)
    const hasAutomate = useAppSelector(getHasAutomate)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )

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
            const res = await fetchSelfServiceConfiguration(
                shopifyIntegration.id
            )

            if (res.article_recommendation_help_center_id) {
                return
            }

            return await updateSelfServiceConfiguration({
                ...res,
                article_recommendation_help_center_id: newHelpCenter.id,
            })
        } catch (err) {
            console.error(err)
        }
    }
}
