import {useCallback, useEffect} from 'react'

import {Draft} from 'immer'

import useAppDispatch from 'hooks/useAppDispatch'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {notify} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {useGetSelfServiceConfiguration} from 'models/selfServiceConfiguration/queries'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'
import {useSelfServiceConfigurationUpdate} from './useSelfServiceConfigurationUpdate'

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
                message: 'Failed to fetch',
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
