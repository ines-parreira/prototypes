import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useDeleteTeam as useDeleteTeamPrimitive,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

const queryKey = queryKeys.teams.listTeams() as string[]
queryKey.pop()

export function useDeleteTeam() {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useDeleteTeamPrimitive({
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
                        message: 'Successfully deleted team',
                        status: NotificationStatus.Success,
                    }),
                )
            },
        },
    })
}
