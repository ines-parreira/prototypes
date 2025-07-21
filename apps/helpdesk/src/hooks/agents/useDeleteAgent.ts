import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    agentsKeys,
    useDeleteAgent as usePureDeleteAgent,
} from 'models/agents/queries'
import { DELETE_AGENT_SUCCESS } from 'state/agents/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { handleError } from './errorHandler'

export const useDeleteAgent = (name: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureDeleteAgent({
        onSuccess: (_data, [id]) => {
            void queryClient.invalidateQueries({
                queryKey: agentsKeys.lists(),
            })
            dispatch({
                type: DELETE_AGENT_SUCCESS,
                id,
            })
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `${name} user has been deleted`,
                }),
            )
        },
        onError: (error) =>
            handleError(error, `Failed to delete ${name} user`, dispatch),
    })
}
