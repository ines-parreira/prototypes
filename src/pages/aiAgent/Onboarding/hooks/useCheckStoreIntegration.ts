import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useCheckStoreIntegration = (shouldCheck: boolean = true): null => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()
    const dispatch = useAppDispatch()

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    // Return early if still loading
    if (isLoading || !shouldCheck) {
        return null
    }

    // If storeIntegration is empty, return the shopify integration step
    if (
        Object.keys(storeIntegration).length === 0 ||
        !shopName ||
        !data?.shopName
    ) {
        dispatch(
            notify({
                status: NotificationStatus.Error,
                message:
                    'There are no existing store integrations. Redirecting to the shopify integration step.',
                id: 'store-integration-empty-error',
            }),
        )
        history.push(
            `/app/ai-agent/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
        )
    }

    return null
}

export default useCheckStoreIntegration
