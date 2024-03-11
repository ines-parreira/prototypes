import {useQueryClient} from '@tanstack/react-query'
import {
    storeConfigurationKeys,
    useUpsertStoreConfigurationPure,
} from '../../models/aiAgent/queries'
import useAppDispatch from '../useAppDispatch'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'

export const useUpsertStoreConfiguration = (
    storeName: string,
    enableNotifications = true
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useUpsertStoreConfigurationPure({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.detail(storeName),
            })
            if (enableNotifications) {
                void dispatch(
                    notify({
                        message: 'AI Agent configuration saved!',
                        status: NotificationStatus.Success,
                    })
                )
            }
        },
        onError: () => {
            if (enableNotifications) {
                void dispatch(
                    notify({
                        message: 'Failed to save AI Agent configuration',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
    })
}
