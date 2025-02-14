import {useHistory, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {ShopifyIntegration} from 'models/integration/types'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

const useCheckStoreIntegration = (): null => {
    const {shopName} = useParams<{shopName: string}>()
    const {data, isLoading} = useGetOnboardingData(shopName)
    const history = useHistory()

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName)
    ).toJS()

    // Return early if still loading
    if (isLoading) {
        return null
    }

    // If storeIntegration is empty, return the shopify integration step
    if (
        Object.keys(storeIntegration).length === 0 ||
        !shopName ||
        !data?.shopName
    ) {
        history.push(
            `/app/ai-agent/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`
        )
    }

    return null
}

export default useCheckStoreIntegration
