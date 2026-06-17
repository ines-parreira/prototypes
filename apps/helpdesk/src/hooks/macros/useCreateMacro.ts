import type { UseMutationOptions } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    CreateMacroBody,
    HttpError,
    HttpResponse,
    Macro,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useCreateMacro as useCreateMacroPrimitive,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useCreateMacro(
    overrides?: UseMutationOptions<
        HttpResponse<Macro>,
        HttpError<unknown>,
        {
            data: CreateMacroBody
        },
        unknown
    >,
) {
    const queryClient = useQueryClient()

    return useCreateMacroPrimitive({
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
                        : 'Failed to create macro',
                )
            },
            onSuccess: () => {
                toast.success('Successfully created macro')
            },
            ...overrides,
        },
    })
}
