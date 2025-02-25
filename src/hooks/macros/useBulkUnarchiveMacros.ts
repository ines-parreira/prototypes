import { useQueryClient } from '@tanstack/react-query'

import {
    ArchiveMacroAsUserResult,
    queryKeys,
    useBulkUnarchiveMacros as useBulkUnarchiveMacrosPrimitive,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useBulkUnarchiveMacros() {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useBulkUnarchiveMacrosPrimitive({
        mutation: {
            onSuccess: (resp) => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
                const macroCount = (
                    resp?.data.data as unknown as {
                        data?: ArchiveMacroAsUserResult[]
                    }
                )?.data?.length
                void dispatch(
                    notify({
                        message: `Successfully unarchived macro${
                            (macroCount ? macroCount > 1 : false) ? 's' : ''
                        }`,
                        status: NotificationStatus.Success,
                    }),
                )
            },
            onError: (error) => {
                void dispatch(
                    notify({
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : 'Failed to unarchive macro(s). Please try again in a few seconds.',
                        message: errorToChildren(error) || undefined,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
        },
    })
}
