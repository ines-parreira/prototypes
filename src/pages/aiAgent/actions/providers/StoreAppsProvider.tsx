import React, {ReactNode, useEffect, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {useGetStoreApps} from 'models/workflows/queries'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

import useAddStoreApp from '../hooks/useAddStoreApp'
import StoreAppsContext, {StoreAppsContextType} from './StoreAppsContext'

type Props = {
    storeName: string
    storeType: 'shopify'
    children?: ReactNode
}

const StoreAppsProvider = ({storeName, storeType, children}: Props) => {
    const {data: storeApps = [], isInitialLoading: isStoreAppsLoading} =
        useGetStoreApps({storeName, storeType})

    const getRechargeIntegrations = useMemo(
        () => getIntegrationsByTypes([IntegrationType.Recharge]),
        []
    )

    const rechargeIntegrations = useAppSelector(getRechargeIntegrations)
    const rechargeIntegration = useMemo(
        () =>
            rechargeIntegrations.find((integration) => {
                return (
                    !integration.deactivated_datetime &&
                    !integration.deleted_datetime &&
                    integration.meta.store_name === storeName &&
                    integration.meta.oauth.status === 'success'
                )
            }),
        [rechargeIntegrations, storeName]
    )

    const addStoreApp = useAddStoreApp({
        storeName,
        storeType,
        integration: rechargeIntegration,
    })

    const remoteRechargeIntegrationId = useMemo(
        () =>
            storeApps.find((storeApp) => storeApp.type === 'recharge')
                ?.integration_id,
        [storeApps]
    )
    const rechargeIntegrationId = rechargeIntegration?.id

    const contextValue = useMemo<StoreAppsContextType>(
        () => ({
            recharge: remoteRechargeIntegrationId ?? rechargeIntegrationId,
        }),
        [remoteRechargeIntegrationId, rechargeIntegrationId]
    )

    useEffect(() => {
        if (isStoreAppsLoading || !rechargeIntegrationId) {
            return
        }

        if (rechargeIntegrationId !== remoteRechargeIntegrationId) {
            void addStoreApp()
        }
    }, [
        isStoreAppsLoading,
        addStoreApp,
        rechargeIntegrationId,
        remoteRechargeIntegrationId,
    ])

    return (
        <StoreAppsContext.Provider value={contextValue}>
            {children}
        </StoreAppsContext.Provider>
    )
}

export default StoreAppsProvider
