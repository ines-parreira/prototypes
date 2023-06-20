import React, {createContext, useMemo} from 'react'

import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {StoreIntegration} from 'models/integration/types'

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

const StoreIntegrationContext = createContext<StoreIntegration | undefined>(
    undefined
)

export const withSelfServiceStoreIntegrationContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            shopType: string
            shopName: string
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const {shopType, shopName} = props
        const storeIntegration = useSelfServiceStoreIntegration(
            shopType,
            shopName
        )
        return (
            <StoreIntegrationContext.Provider value={storeIntegration}>
                <Component {...props} />
            </StoreIntegrationContext.Provider>
        )
    }

export const useSelfServiceStoreIntegrationContext = () => {
    const storeIntegration = React.useContext(StoreIntegrationContext)
    if (!storeIntegration) {
        throw new Error(
            'useSelfServiceStoreIntegrationContext must be used within a component wrapped with withSelfServiceStoreIntegrationContext'
        )
    }
    return storeIntegration
}
