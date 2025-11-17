import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateTeam as useUpdateTeamPrimitive,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

export function useUpdateTeam(id: number) {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const queryKey = queryKeys.teams.getTeam(id) as string[]

    return useUpdateTeamPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
            onError: (error) => {
                void dispatch(
                    notify({
                        title: (error as GorgiasApiError).response.data.error
                            .msg,
                        message: errorToChildren(error)!,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
            onSuccess: () => {
                void dispatch(
                    notify({
                        message: 'Successfully updated team',
                        status: NotificationStatus.Success,
                    }),
                )
            },
        },
    })
}
