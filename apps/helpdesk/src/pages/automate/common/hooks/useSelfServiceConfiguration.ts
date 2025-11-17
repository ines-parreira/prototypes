import { useCallback, useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import type { Draft } from 'immer'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    selfServiceConfigurationKeys,
    useGetSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/queries'
import { updateSelfServiceConfigurationSSP } from 'models/selfServiceConfiguration/resources'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { notify } from 'state/notifications/actions'
import type { AlertNotification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'

import { useSelfServiceConfigurationUpdate } from './useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: AlertNotification) => void,
) => {
    const dispatch = useAppDispatch()
    const { hasAccess } = useAiAgentAccess(shopName)
    const queryClient = useQueryClient()

    const { data: selfServiceConfiguration, isLoading: isFetchPending } =
        useGetSelfServiceConfiguration(shopType, shopName)

    useEffect(() => {
        if (selfServiceConfiguration?.deletedDatetime && hasAccess) {
            void updateSelfServiceConfigurationSSP({
                ...selfServiceConfiguration,
                deletedDatetime: null,
            })
                .then((res) => {
                    queryClient.setQueryData(
                        selfServiceConfigurationKeys.detail(shopName, shopType),
                        res,
                    )
                })
                .catch(console.error)
        }
    }, [hasAccess, selfServiceConfiguration, queryClient, shopName, shopType])

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
        [notificationHandler, dispatch],
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
                draft: Draft<SelfServiceConfiguration>,
            ) => void,
            messages: { success?: string; error?: string } = {},
        ) => {
            if (!storeIntegrationId) {
                return
            }

            await handleConfigurationUpdate(
                patchSelfServiceConfiguration,
                messages,
                storeIntegrationId,
            )
        },
        [handleConfigurationUpdate, storeIntegrationId],
    )

    useEffect(() => {
        if (!storeIntegrationId && shopName && shopType) {
            handleNotify({
                message: 'Failed to fetch store integration',
                status: NotificationStatus.Error,
            })
        }
    }, [storeIntegrationId, handleNotify, shopName, shopType])

    return {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    }
}

export default useSelfServiceConfiguration
