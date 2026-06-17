import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import {
    agentsKeys,
    useCreateAgent as usePureCreateAgent,
} from 'models/agents/queries'
import { CREATE_AGENT_SUCCESS } from 'state/agents/constants'
import { errorToChildren } from 'utils'

import { handleError } from './errorHandler'

export const useCreateAgent = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateAgent({
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: agentsKeys.lists(),
            })
            dispatch({
                type: CREATE_AGENT_SUCCESS,
                resp: data.data,
            })
            toast.success(
                `Team member created. We've sent login instructions to ${data.data.email}.`,
            )
        },
        onError: (error) => {
            const mappedError = errorToChildren(error)

            handleError(
                null,
                mappedError as string,
                'Error while creating user',
            )
        },
    })
}
