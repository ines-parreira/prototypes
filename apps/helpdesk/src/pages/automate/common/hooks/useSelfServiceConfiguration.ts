import { useCallback, useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import type { Draft } from 'immer'

import { toast } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import {
    selfServiceConfigurationKeys,
    useGetSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/queries'
import { updateSelfServiceConfigurationSSP } from 'models/selfServiceConfiguration/resources'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import type { AlertNotification } from 'state/notifications/types'

import { useSelfServiceConfigurationUpdate } from './useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: AlertNotification) => void,
) => {
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
                const message = notif.message ?? ''
                if (notif.status === 'error') {
                    toast.error(message)
                } else if (notif.status === 'warning') {
                    toast.warning(message)
                } else if (notif.status === 'success') {
                    toast.success(message)
                } else {
                    toast.info(message)
                }
            }
        },
        [notificationHandler],
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
                status: 'error' as AlertNotification['status'],
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
