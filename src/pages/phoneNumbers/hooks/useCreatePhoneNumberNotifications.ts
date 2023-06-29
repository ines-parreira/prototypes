import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {errorToChildren} from 'utils'
import {
    CustomNotifications,
    UPGRADE_MESSAGE_NOTIFICATION_SETTINGS,
} from '../constants'

export default function useCreatePhoneNumberNotifications() {
    const dispatch = useAppDispatch()

    const showCreatePhoneNumberErrorNotification = ({error}: {error: any}) => {
        const {response} = error as AxiosError<{
            error: {msg: string; data: {use_custom: string | null}}
        }>
        const customNotificationName = response?.data?.error?.data?.use_custom
        if (customNotificationName === CustomNotifications.UPGRADE_MESSAGE) {
            void dispatch(
                notify({
                    ...UPGRADE_MESSAGE_NOTIFICATION_SETTINGS,
                    title: 'Cannot add phone number.',
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        const errors = errorToChildren(error)
        const title =
            response?.data?.error?.msg ?? 'Failed to create phone number'
        void dispatch(
            notify({
                title,
                message: errors ?? '',
                status: NotificationStatus.Error,
                allowHTML: true,
            })
        )
    }

    return {showCreatePhoneNumberErrorNotification}
}
