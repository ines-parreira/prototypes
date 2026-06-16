import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type { ArchiveMacroAsUserResult, Macro } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useBulkArchiveMacros as useBulkArchiveMacrosPrimitive,
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

export function useBulkArchiveMacros(macros?: Macro[]) {
    const queryClient = useQueryClient()

    return useBulkArchiveMacrosPrimitive({
        mutation: {
            onSettled: (resp) => {
                const errors: ArchiveMacroAsUserResult[] = []
                const successes: string[] = []
                getArchiveMacroResults(resp?.data.data).forEach((data) => {
                    if (data.error) {
                        errors.push(data)
                    } else {
                        const macroName = macros?.find(
                            ({ id }) => id === data.id,
                        )?.name
                        successes.push(macroName ?? '')
                    }
                })
                if (!!successes.length) {
                    toast.success(
                        `Successfully archived macro${successes.length > 1 ? 's' : ''}${successes[0] ? ': ' + successes.join(', ') : ''}`,
                    )
                }

                if (errors) {
                    for (const data of errors) {
                        const macroName = macros?.find(
                            ({ id }) => id === data.id,
                        )?.name

                        toast.error(
                            `${macroName ? macroName + ': ' : ''}${data.error?.msg}`,
                        )
                    }
                }
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
            onError: (error) => {
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to archive macro(s). Please try again in a few seconds.',
                )
            },
        },
    })
}
