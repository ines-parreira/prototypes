import {useQueryClient} from '@tanstack/react-query'
import {produce, Draft} from 'immer'

import useAsyncFn from 'hooks/useAsyncFn'
import {
    selfServiceConfigurationKeys,
    useUpdateSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/queries'
import {fetchSelfServiceConfigurationSSP} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {AlertNotification, NotificationStatus} from 'state/notifications/types'

import useStoreIntegrations from './useStoreIntegrations'

export type UseSelfServiceConfigurationUpdateProps = {
    handleNotify: (notification: AlertNotification) => void
}
export const useSelfServiceConfigurationUpdate = ({
    handleNotify,
}: UseSelfServiceConfigurationUpdateProps) => {
    const {mutateAsync} = useUpdateSelfServiceConfiguration()
    const queryClient = useQueryClient()
    const storeIntegrations = useStoreIntegrations()
    const [{loading: isUpdatePending}, handleSelfServiceConfigurationUpdate] =
        useAsyncFn(
            async (
                patchSelfServiceConfiguration: (
                    draft: Draft<SelfServiceConfiguration>
                ) => void,
                messages: {success?: string; error?: string} = {},
                storeIntegrationId: number
            ) => {
                try {
                    const integration = storeIntegrations.find(
                        (storeIntegration) =>
                            storeIntegration.id === storeIntegrationId
                    )

                    if (!integration) {
                        throw new Error('Store integration not found')
                    }

                    const selfServiceConfiguration =
                        await fetchSelfServiceConfigurationSSP(
                            getShopNameFromStoreIntegration(integration),
                            integration.type
                        )

                    const res = await mutateAsync([
                        produce(
                            selfServiceConfiguration,
                            patchSelfServiceConfiguration
                        ),
                    ])

                    queryClient.setQueryData(
                        selfServiceConfigurationKeys.detail(
                            getShopNameFromStoreIntegration(integration),
                            integration.type
                        ),
                        res
                    )

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
            [storeIntegrations]
        )

    return {
        isUpdatePending,
        handleSelfServiceConfigurationUpdate,
    }
}
