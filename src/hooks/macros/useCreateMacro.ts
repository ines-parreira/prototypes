import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateMacro as useCreateMacroPrimitive,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useCreateMacro(errorMessage?: string) {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useCreateMacroPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
            onError: (error) => {
                void dispatch(
                    notify({
                        title:
                            (error as GorgiasApiError).response.data.error
                                .msg ??
                            errorMessage ??
                            'Failed to create macro',
                        message: errorToChildren(error)!,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
            onSuccess: () => {
                void dispatch(
                    notify({
                        message: 'Successfully created macro',
                        status: NotificationStatus.Success,
                    }),
                )
            },
        },
    })
}
