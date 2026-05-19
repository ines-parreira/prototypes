import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import { updateSegment } from '@gorgias/customer-segmentation-client'
import type { UpdateSegmentRequest } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from 'AIJourney/queries/utils'

export const useUpdateSegment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.segmentsAll(),
            })
            toast.success('Segment updated successfully')
        },
        onError: () => {
            toast.error('Error updating segment')
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
