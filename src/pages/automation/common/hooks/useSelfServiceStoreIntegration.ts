import {useMemo} from 'react'

import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'

import useStoreIntegrations from './useStoreIntegrations'

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
