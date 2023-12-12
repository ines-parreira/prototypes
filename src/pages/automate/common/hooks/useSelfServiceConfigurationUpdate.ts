import {produce, Draft} from 'immer'

import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import {
    fetchSelfServiceConfiguration,
    updateSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

export type UseSelfServiceConfigurationUpdateProps = {
    handleNotify: (notification: Notification) => void
}
export const useSelfServiceConfigurationUpdate = ({
    handleNotify,
}: UseSelfServiceConfigurationUpdateProps) => {
    const dispatch = useAppDispatch()

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
                    const selfServiceConfiguration =
                        await fetchSelfServiceConfiguration(storeIntegrationId)
                    const res = await updateSelfServiceConfiguration(
                        produce(
                            selfServiceConfiguration,
                            patchSelfServiceConfiguration
                        )
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

    return {
        isUpdatePending,
        handleSelfServiceConfigurationUpdate,
    }
}
