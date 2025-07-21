import React, { ComponentProps, ComponentType } from 'react'

import StoreIntegrationView from '../components/StoreIntegrationView'
import useStoreIntegrations from '../hooks/useStoreIntegrations'

export const withStoreIntegration = (
    title: string,
    Component: ComponentType<Record<string, unknown>>,
) => {
    return (ownProps: ComponentProps<typeof Component>) => {
        const storeIntegrations = useStoreIntegrations()

        return storeIntegrations?.length ? (
            <Component {...ownProps} />
        ) : (
            <StoreIntegrationView title={title} />
        )
    }
}

export default withStoreIntegration
