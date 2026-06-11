import { useEffect } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const useCheckStoreIntegration = (shouldCheck = true): null => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const isIntegrationEmpty = Object.keys(storeIntegration).length === 0

    const shouldRedirect =
        shouldCheck &&
        !isLoading &&
        (isIntegrationEmpty || !shopName || !data?.shopName)

    useEffect(() => {
        if (!shouldRedirect) return

        toast.error(
            'There are no existing store integrations. Redirecting to the shopify integration step.',
            { id: 'store-integration-empty-error' },
        )
        const redirectPath =
            shopType && shopName
                ? `/app/ai-agent/${shopType}/${shopName}/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`
                : `/app/ai-agent/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`
        history.push(redirectPath)
    }, [shouldRedirect, shopType, shopName, history])

    return null
}
