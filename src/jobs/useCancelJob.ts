import {useCancelJob as useCancelJobQuery} from '@gorgias/api-queries'
import {AxiosError} from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useNotificationPayload from './useNotificationPayload'

type Props = {
    getNotificationPayload: ReturnType<
        typeof useNotificationPayload
    >['getNotificationPayload']
}

const useCancelJob = ({getNotificationPayload}: Props) => {
    const dispatch = useAppDispatch()

    const {mutate: cancelJob} = useCancelJobQuery({
        mutation: {
            onSuccess: () => {
                void dispatch(
                    notify({
                        ...getNotificationPayload(),
                        status: NotificationStatus.Success,
                        message: 'The job has been canceled.',
                    })
                )
            },
            onError: (error: AxiosError<{error: {msg: string}}>) => {
                void dispatch(
                    notify({
                        ...getNotificationPayload(),
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
