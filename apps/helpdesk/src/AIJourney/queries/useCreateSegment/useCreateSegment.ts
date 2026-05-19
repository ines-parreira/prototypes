import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import { createSegment } from '@gorgias/customer-segmentation-client'
import type { CreateSegmentRequest } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from 'AIJourney/queries/utils'

const postCreateSegment = async (params: CreateSegmentRequest) => {
    return createSegment(params).then((res) => res.data)
}

export const useCreateSegment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (params: CreateSegmentRequest) => postCreateSegment(params),
        onSuccess: (_, { integration_id }) => {
            queryClient.invalidateQueries({
                queryKey: [...aiJourneyKeys.all(), 'segments', integration_id],
            })
            queryClient.invalidateQueries({
                queryKey: ['audience-segments', integration_id],
            })
            toast.success('Segment created')
        },
        onError: () => {
            toast.error('Error creating segment')
        },
    })
}
