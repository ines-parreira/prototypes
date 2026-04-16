import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateSegment } from '@gorgias/customer-segmentation-client'
import type { UpdateSegmentRequest } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useUpdateSegment = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.segmentsAll(),
            })
            void dispatch(
                notify({
                    message: 'Segment updated successfully',
                    status: NotificationStatus.Success,
                }),
            )
        },
        onError: () => {
            void dispatch(
                notify({
                    message: 'Error updating segment',
                    status: NotificationStatus.Error,
                }),
            )
        },
        mutationFn: async ({
            segmentId,
            updateSegmentRequest,
        }: {
            segmentId: string
            updateSegmentRequest: UpdateSegmentRequest
        }) => {
            return updateSegment(segmentId, updateSegmentRequest).then(
                (res) => res.data,
            )
        },
    })
}
