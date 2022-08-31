import {Map} from 'immutable'
import {useEffect, useState} from 'react'
import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {GorgiasChatIntegration} from 'models/integration/types'
import {fetchChatHelpCenterConfiguration} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from '../../../models/selfServiceConfiguration/types'

export const hasShopifyIntegrationSSPEnabled = (
    shopifyIntegration: Map<any, any>,
    selfServiceConfigurations: SelfServiceConfiguration[]
): boolean => {
    const shopifyIntegrationHasSSP = selfServiceConfigurations.find(
        (configuration) => {
            return (
                configuration.shop_name ===
                    shopifyIntegration.getIn(['meta', 'shop_name']) &&
                configuration.deactivated_datetime === null
            )
        }
    )

    return !!shopifyIntegrationHasSSP
}

export const useIsArticleRecommendationDisabled = (shouldFetch: boolean) => {
    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat])
    ).toJS() as GorgiasChatIntegration[]
    const [
        isArticleRecommendationDisabled,
        setIsArticleRecommendationDisabled,
    ] = useState(false)

    useEffect(() => {
        if (!shouldFetch) return

        const chatApplicationIds = chatIntegrations.map(
            (chatIntegration) => chatIntegration.meta.app_id
        )

        const chatHelpCenterConfigurationsPromise = Promise.all(
            chatApplicationIds.map(async (chatApplicationId) => {
                if (!chatApplicationId) return

                try {
                    const data = await fetchChatHelpCenterConfiguration(
                        Number(chatApplicationId)
                    )
                    return data
                } catch {
                    return
                }
            })
        )

        void chatHelpCenterConfigurationsPromise.then(
            (chatHelpCenterConfigurations) =>
                setIsArticleRecommendationDisabled(
                    !chatHelpCenterConfigurations.some(
                        (chatHelpCenterConfiguration) =>
                            chatHelpCenterConfiguration?.enabled
                    )
                )
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetch])

    return isArticleRecommendationDisabled
}
