import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {errorToChildren} from 'utils'
import {CustomNotifications} from '../constants'

export default function useCreatePhoneNumberNotifications() {
    const dispatch = useAppDispatch()

    const showCreatePhoneNumberErrorNotification = ({error}: {error: any}) => {
        const upgradePlanPath = '/app/settings/billing'

        const {response} = error as AxiosError<{
            error: {msg: string; data: {use_custom: string | null}}
        }>
        const customNotificationName = response?.data?.error?.data?.use_custom
        if (customNotificationName === CustomNotifications.UPGRADE_MESSAGE) {
            void dispatch(
                notify({
                    message: `
                        <div>
                            If you're on a Trial or Starter plan, upgrade your
                            account
                            <a href='${upgradePlanPath}'>here</a>. If
                            you have a Basic+ plan, select an Add-on plan to use
                            the integration
                            <a
                                href='https://gorgias.typeform.com/to/gH7HYEHu?utm_source=in_product&utm_campaign=phone_vetting#email=xxxxx&domain=xxxxx&plan=xxxxx'
                                target="_blank"
                                rel="noopener noreferrer"
                            >here</a>.
                        </div>
                    `,
                    allowHTML: true,
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
