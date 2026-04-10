import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSegment } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useDeleteSegment = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.segmentsAll(),
            })
            void dispatch(
                notify({
                    message: 'Segment deleted successfully',
                    status: NotificationStatus.Success,
                }),
            )
        },
        onError: () => {
            void dispatch(
                notify({
                    message: `Error deleting segment`,
                    status: NotificationStatus.Error,
                }),
            )
        },
        mutationFn: async ({ segmentId }: { segmentId: string }) => {
            return deleteSegment(segmentId).then((res) => res.data)
        },
    })
}
