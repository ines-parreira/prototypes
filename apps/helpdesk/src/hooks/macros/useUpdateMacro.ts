import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useUpdateMacro as useUpdateMacroPrimitive,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useUpdateMacro(errorMessage?: string) {
    const queryClient = useQueryClient()

    return useUpdateMacroPrimitive({
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
                        : (errorMessage ?? 'Failed to update macro'),
                )
            },
            onSuccess: () => {
                toast.success('Successfully updated macro')
            },
        },
    })
}
