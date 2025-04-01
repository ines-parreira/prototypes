import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { hasIntegrationOfTypes } from 'state/integrations/selectors'

export const useHasShopifyIntegration = () =>
    useAppSelector(hasIntegrationOfTypes(IntegrationType.Shopify))
