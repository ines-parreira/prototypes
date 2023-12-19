import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {useInviteAgent as usePureInviteAgent} from 'models/agents/queries'

import {handleError} from './errorHandler'

export const useInviteAgent = (email: string) => {
    const dispatch = useAppDispatch()
    return usePureInviteAgent({
        onSuccess: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Invite has been sent to ${email}`,
                })
            )
        },
        onError: (error) =>
            handleError(error, 'Failed to send invite', dispatch),
    })
}
