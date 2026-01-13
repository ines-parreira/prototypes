import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useCheckStoreIntegration = (options?: { shouldCheck: boolean }): null => {
    const shouldCheck = options?.shouldCheck ?? true

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
