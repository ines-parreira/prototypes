import {useQueryClient} from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {UPDATE_AGENT_SUCCESS} from 'state/agents/constants'
import {
    agentsKeys,
    useUpdateAgent as usePureUpdateAgent,
} from 'models/agents/queries'

import {handleError} from './errorHandler'

export const useUpdateAgent = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureUpdateAgent({
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: agentsKeys.all(),
            })
            dispatch({
                type: UPDATE_AGENT_SUCCESS,
                resp: data.data,
            })
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Team member updated',
                })
            )
        },
        onError: (error) =>
            handleError(error, 'Failed to update team member', dispatch),
    })
}
