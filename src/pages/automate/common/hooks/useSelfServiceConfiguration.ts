import {Draft} from 'immer'
import {useCallback, useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'

import {useGetSelfServiceConfiguration} from 'models/selfServiceConfiguration/queries'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {notify} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {useSelfServiceConfigurationUpdate} from './useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: Notification) => void
) => {
    const dispatch = useAppDispatch()
    const {data: selfServiceConfiguration, isLoading: isFetchPending} =
        useGetSelfServiceConfiguration(shopType, shopName)

    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const storeIntegrationId = storeIntegration?.id
    const handleNotify = useCallback(
        (notif: Notification) => {
            if (notificationHandler) {
                notificationHandler(notif)
            } else {
                void dispatch(notify(notif))
            }
        },
        [notificationHandler, dispatch]
    )

    const {
        isUpdatePending,
        handleSelfServiceConfigurationUpdate: handleConfigurationUpdate,
    } = useSelfServiceConfigurationUpdate({
        handleNotify,
    })
    const handleSelfServiceConfigurationUpdate = useCallback(
        async (
            patchSelfServiceConfiguration: (
                draft: Draft<SelfServiceConfiguration>
            ) => void,
            messages: {success?: string; error?: string} = {}
        ) => {
            if (!storeIntegrationId) {
                return
            }

            await handleConfigurationUpdate(
                patchSelfServiceConfiguration,
                messages,
                storeIntegrationId
            )
        },
        [handleConfigurationUpdate, storeIntegrationId]
    )

    useEffect(() => {
        if (!storeIntegrationId) {
            handleNotify({
                message: 'Failed to fetch store integration',
                status: NotificationStatus.Error,
            })
        }
    }, [storeIntegrationId, handleNotify])

    return {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    }
}

export default useSelfServiceConfiguration
