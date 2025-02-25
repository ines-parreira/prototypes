import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateMacro as useUpdateMacroPrimitive,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export function useUpdateMacro(errorMessage?: string) {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useUpdateMacroPrimitive({
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
                            'Failed to update macro',
                        message: errorToChildren(error)!,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
            onSuccess: () => {
                void dispatch(
                    notify({
                        message: 'Successfully updated macro',
                        status: NotificationStatus.Success,
                    }),
                )
            },
        },
    })
}
