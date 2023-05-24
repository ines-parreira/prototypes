import {useCallback, useEffect, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {useAsyncFn} from 'react-use'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {
    fetchSelfServiceConfiguration,
    updateSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/resources'
import {
    selfServiceConfigurationFetched,
    selfServiceConfigurationUpdated,
} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {reportError} from 'utils/errors'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (
    shopType: string,
    shopName: string,
    notificationHandler?: (notification: Notification) => void
) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
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
                history.push('/app/automation/macros')
            }
        }, [])
    const [{loading: isUpdatePending}, handleSelfServiceConfigurationUpdate] =
        useAsyncFn(
            async (
                selfServiceConfiguration: SelfServiceConfiguration,
                messages: {success?: string; error?: string} = {}
            ) => {
                try {
                    const res = await updateSelfServiceConfiguration(
                        selfServiceConfiguration
                    )
                    void dispatch(selfServiceConfigurationUpdated(res))
                    handleNotify({
                        message: messages.success ?? 'Successfully updated',
                        status: NotificationStatus.Success,
                    })
                } catch (error) {
                    handleNotify({
                        message: messages.error ?? 'Failed to update',
                        status: NotificationStatus.Error,
                    })
                }
            },
            []
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
            history.push('/app/automation/macros')
        }
    }, [storeIntegrationId, history, handleNotify])

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
