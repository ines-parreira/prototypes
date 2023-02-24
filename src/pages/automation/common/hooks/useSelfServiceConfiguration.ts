import {useEffect, useMemo} from 'react'
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
import {NotificationStatus} from 'state/notifications/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceConfiguration = (shopType: string, shopName: string) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const storeIntegrationId = storeIntegration?.id

    const [{loading: isFetchPending}, handleSelfServiceConfigurationFetch] =
        useAsyncFn(async (storeIntegrationId: number) => {
            try {
                const res = await fetchSelfServiceConfiguration(
                    storeIntegrationId
                )
                void dispatch(selfServiceConfigurationFetched(res))
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch',
                        status: NotificationStatus.Error,
                    })
                )
                history.push('/app/automation')
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
                    void dispatch(
                        notify({
                            message: messages.success ?? 'Successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (error) {
                    void dispatch(
                        notify({
                            message: messages.error ?? 'Failed to update',
                            status: NotificationStatus.Error,
                        })
                    )
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
            void dispatch(
                notify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                })
            )
            history.push('/app/automation')
        }
    }, [storeIntegrationId, dispatch, history])

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
