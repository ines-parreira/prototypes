import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getShopifyIntegrationsSortedByName} from 'state/integrations/selectors'

export const useShopifyIntegrations = () => {
    const shopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName
    )
    return useMemo(() => shopifyIntegrations, [shopifyIntegrations])
}
