import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import {
    agentsKeys,
    useUpdateAgent as usePureUpdateAgent,
} from 'models/agents/queries'
import { UPDATE_AGENT_SUCCESS } from 'state/agents/constants'

import { errorToChildren } from '../../utils'
import { handleError } from './errorHandler'

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
            toast.success('Team member updated')
        },
        onError: (error) => {
            const mappedError = errorToChildren(error)

            handleError(
                null,
                mappedError as string,
                'Error while updating user',
            )
        },
    })
}
