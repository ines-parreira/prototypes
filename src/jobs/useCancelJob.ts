import {useCancelJob as useCancelJobQuery} from '@gorgias/api-queries'
import {AxiosError} from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useNotificationPayload from './useNotificationPayload'

type Props = {
    notificationPayload: ReturnType<typeof useNotificationPayload>
}

const useCancelJob = ({notificationPayload}: Props) => {
    const dispatch = useAppDispatch()

    const {mutate: cancelJob} = useCancelJobQuery({
        mutation: {
            onSuccess: () => {
                void dispatch(
                    notify({
                        ...notificationPayload,
                        status: NotificationStatus.Success,
                        message: 'The job has been canceled.',
                    })
                )
            },
            onError: (error: AxiosError<{error: {msg: string}}>) => {
                void dispatch(
                    notify({
                        ...notificationPayload,
                        status: NotificationStatus.Error,
                        message: error.response?.data.error.msg,
                    })
                )
            },
        },
    })

    return {cancelJob}
}

export default useCancelJob
