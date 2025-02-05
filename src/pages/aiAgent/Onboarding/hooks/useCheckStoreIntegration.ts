import useAppSelector from 'hooks/useAppSelector'
import {ShopifyIntegration} from 'models/integration/types'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

const useCheckStoreIntegration = ({
    storeName,
    isLoading,
    setCurrentStep,
}: {
    storeName: string
    isLoading: boolean
    setCurrentStep?: (step: WizardStepEnum) => void
}): null => {
    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(storeName)
    ).toJS()

    // Return early if still loading
    if (isLoading) {
        return null
    }

    // If storeIntegration is empty, return the shopify integration step
    if (Object.keys(storeIntegration).length === 0) {
        setCurrentStep?.(WizardStepEnum.SHOPIFY_INTEGRATION)
    }

    return null
}

export default useCheckStoreIntegration
