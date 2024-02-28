import {useGetStoreConfigurationPure} from '../../models/aiAgent/queries'
import useAppDispatch from '../useAppDispatch'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {GetStoreConfigurationParams} from '../../models/aiAgent/types'

export const useGetStoreConfiguration = (
    params: GetStoreConfigurationParams
) => {
    const dispatch = useAppDispatch()

    return useGetStoreConfigurationPure(params, {
        onError: () => {
            void dispatch(
                notify({
                    message: 'Failed to fetch AI Agent configuration',
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
