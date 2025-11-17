import { useQueryClient } from '@tanstack/react-query'

import type { ArchiveMacroAsUserResult, Macro } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useBulkArchiveMacros as useBulkArchiveMacrosPrimitive,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useBulkArchiveMacros(macros?: Macro[]) {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useBulkArchiveMacrosPrimitive({
        mutation: {
            onSettled: (resp) => {
                const errors: ArchiveMacroAsUserResult[] = []
                const successes: string[] = []
                ;(
                    resp?.data.data as unknown as {
                        data?: ArchiveMacroAsUserResult[]
                    }
                )?.data?.forEach((data) => {
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
                    void dispatch(
                        notify({
                            message: `Successfully archived macro${successes.length > 1 ? 's' : ''}${successes[0] ? ': ' + successes.join(', ') : ''}`,
                            status: NotificationStatus.Success,
                        }),
                    )
                }

                if (errors) {
                    for (const data of errors) {
                        const macroName = macros?.find(
                            ({ id }) => id === data.id,
                        )?.name

                        void dispatch(
                            notify({
                                title: `${macroName ? macroName + ': ' : ''}${data.error?.msg}`,
                                message: errorToChildren({
                                    response: {
                                        data: {
                                            error: {
                                                data: data.error?.data,
                                            },
                                        },
                                    },
                                })!,
                                allowHTML: true,
                                status: NotificationStatus.Error,
                            }),
                        )
                    }
                }
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
            onError: (error) => {
                void dispatch(
                    notify({
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : 'Failed to archive macro(s). Please try again in a few seconds.',
                        message: errorToChildren(error) || undefined,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
        },
    })
}
