import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useDeleteMacro as useDeleteMacroPrimitive,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useDeleteMacro() {
    const queryClient = useQueryClient()

    return useDeleteMacroPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
            onError: (error) => {
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response.data.error.msg
                        : 'Failed to delete macro',
                )
            },
            onSuccess: () => {
                toast.success('Successfully deleted macro')
            },
        },
    })
}
