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

import useStoreIntegrations from './useStoreIntegrations'
import {getShopNameFromStoreIntegration} from './utils'

const useSelfServiceConfiguration = (
    integrationType: string,
    integrationId: string
) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const storeIntegrations = useStoreIntegrations()
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    const [{loading: isFetchPending}, handleSelfServiceConfigurationFetch] =
        useAsyncFn(async () => {
            try {
                const res = await fetchSelfServiceConfiguration(integrationId)
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
        }, [integrationId])
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
        const storeIntegrationId = parseInt(integrationId, 10)
        const storeIntegration = storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.type === integrationType &&
                storeIntegration.id === storeIntegrationId
        )

        if (!storeIntegration) {
            return null
        }

        const shopName = getShopNameFromStoreIntegration(storeIntegration)

        return (
            selfServiceConfigurations.find(
                (selfServiceConfiguration) =>
                    selfServiceConfiguration.type === integrationType &&
                    selfServiceConfiguration.shop_name === shopName
            ) ?? null
        )
    }, [
        integrationType,
        integrationId,
        storeIntegrations,
        selfServiceConfigurations,
    ])

    useEffect(() => {
        if (!selfServiceConfiguration) {
            void handleSelfServiceConfigurationFetch()
        }
    }, [selfServiceConfiguration, handleSelfServiceConfigurationFetch])

    return {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    }
}

export default useSelfServiceConfiguration
