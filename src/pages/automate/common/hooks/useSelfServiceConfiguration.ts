import {useQueryClient} from '@tanstack/react-query'
import {Draft} from 'immer'
import {useCallback, useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'

import useAppSelector from 'hooks/useAppSelector'
import {
    selfServiceConfigurationKeys,
    useGetSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/queries'
import {updateSelfServiceConfigurationSSP} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {getHasAutomate} from 'state/billing/selectors'
import {notify} from 'state/notifications/actions'
import {AlertNotification, NotificationStatus} from 'state/notifications/types'

import {useSelfServiceConfigurationUpdate} from './useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: AlertNotification) => void
) => {
    const dispatch = useAppDispatch()
    const hasAutomate = useAppSelector(getHasAutomate)
    const queryClient = useQueryClient()

    const {data: selfServiceConfiguration, isLoading: isFetchPending} =
        useGetSelfServiceConfiguration(shopType, shopName)

    useEffect(() => {
        if (selfServiceConfiguration?.deletedDatetime && hasAutomate) {
            void updateSelfServiceConfigurationSSP({
                ...selfServiceConfiguration,
                deletedDatetime: null,
            })
                .then((res) => {
                    queryClient.setQueryData(
                        selfServiceConfigurationKeys.detail(shopName, shopType),
                        res
                    )
                })
                .catch(console.error)
        }
    }, [hasAutomate, selfServiceConfiguration, queryClient, shopName, shopType])

    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const storeIntegrationId = storeIntegration?.id
    const handleNotify = useCallback(
        (notif: AlertNotification) => {
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
