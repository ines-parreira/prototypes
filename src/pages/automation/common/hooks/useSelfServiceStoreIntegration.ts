import {useMemo} from 'react'

import useStoreIntegrations from './useStoreIntegrations'
import {getShopNameFromStoreIntegration} from './utils'

const useSelfServiceStoreIntegration = (shopType: string, shopName: string) => {
    const storeIntegrations = useStoreIntegrations()

    return useMemo(() => {
        return storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.type === shopType &&
                getShopNameFromStoreIntegration(storeIntegration) === shopName
        )
    }, [storeIntegrations, shopType, shopName])
}

export default useSelfServiceStoreIntegration
