import {useCallback, useEffect, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {Draft} from 'immer'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {
    fetchSelfServiceConfiguration,
    updateSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/resources'
import {selfServiceConfigurationFetched} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'
import {useSelfServiceConfigurationUpdate} from './useSelfServiceConfigurationUpdate'
import {useIsAutomateRebranding} from './useIsAutomateRebranding'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: Notification) => void
) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const {isAutomateRebranding} = useIsAutomateRebranding()
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )
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

    const [{loading: isFetchPending}, handleSelfServiceConfigurationFetch] =
        useAsyncFn(async (storeIntegrationId: number) => {
            try {
                let res = await fetchSelfServiceConfiguration(
                    storeIntegrationId
                )
                if (res.deactivated_datetime) {
                    reportError(
                        new Error('Self-service configuration is deactivated'),
                        {extra: {shopName: res.shop_name, shopType: res.type}}
                    )
                    res = await updateSelfServiceConfiguration({
                        ...res,
                        deactivated_datetime: null,
                    })
                }
                void dispatch(selfServiceConfigurationFetched(res))
            } catch (error) {
                handleNotify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                })
            }
        }, [])

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

    const selfServiceConfiguration = useMemo(() => {
        return selfServiceConfigurations.find(
            (selfServiceConfiguration) =>
                selfServiceConfiguration.type === shopType &&
                selfServiceConfiguration.shop_name === shopName
        )
    }, [shopType, shopName, selfServiceConfigurations])

    useEffect(() => {
        if (!storeIntegrationId) {
            handleNotify({
                message: 'Failed to fetch',
                status: NotificationStatus.Error,
            })
        }
    }, [storeIntegrationId, history, handleNotify, isAutomateRebranding])

    useEffect(() => {
        if (!selfServiceConfiguration && storeIntegrationId) {
            void handleSelfServiceConfigurationFetch(storeIntegrationId)
        }
    }, [
        selfServiceConfiguration,
        storeIntegrationId,
        handleSelfServiceConfigurationFetch,
    ])

    return {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    }
}

export default useSelfServiceConfiguration
