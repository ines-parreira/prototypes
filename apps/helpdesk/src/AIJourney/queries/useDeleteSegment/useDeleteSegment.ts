import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import { deleteSegment } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'

export const useDeleteSegment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.segmentsAll(),
            })
            toast.success('Segment deleted successfully')
        },
        onError: () => {
            toast.error('Error deleting segment')
        },
        mutationFn: async ({ segmentId }: { segmentId: string }) => {
            return deleteSegment(segmentId).then((res) => res.data)
        },
    })
}
