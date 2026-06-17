import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type { ArchiveMacroAsUserResult } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useBulkUnarchiveMacros as useBulkUnarchiveMacrosPrimitive,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

function getArchiveMacroResults(
    responseData: unknown,
): ArchiveMacroAsUserResult[] {
    if (Array.isArray(responseData)) {
        return responseData
    }

    return (
        (responseData as { data?: ArchiveMacroAsUserResult[] } | undefined)
            ?.data ?? []
    )
}

export function useBulkUnarchiveMacros() {
    const queryClient = useQueryClient()

    return useBulkUnarchiveMacrosPrimitive({
        mutation: {
            onSuccess: (resp) => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
                const macroCount = getArchiveMacroResults(
                    resp?.data.data,
                ).length
                toast.success(
                    `Successfully unarchived macro${
                        (macroCount ? macroCount > 1 : false) ? 's' : ''
                    }`,
                )
            },
            onError: (error) => {
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to unarchive macro(s). Please try again in a few seconds.',
                )
            },
        },
    })
}
