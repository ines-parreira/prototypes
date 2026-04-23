import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSegment } from '@gorgias/customer-segmentation-client'
import type { CreateSegmentRequest } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const postCreateSegment = async (params: CreateSegmentRequest) => {
    return createSegment(params).then((res) => res.data)
}

export const useCreateSegment = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: (params: CreateSegmentRequest) => postCreateSegment(params),
        onSuccess: (_, { integration_id }) => {
            queryClient.invalidateQueries({
                queryKey: [...aiJourneyKeys.all(), 'segments', integration_id],
            })
            queryClient.invalidateQueries({
                queryKey: ['audience-segments', integration_id],
            })
            void dispatch(
                notify({
                    message: 'Segment created',
                    status: NotificationStatus.Success,
                }),
            )
        },
        onError: () => {
            void dispatch(
                notify({
                    message: `Error creating segment`,
                    status: NotificationStatus.Error,
                }),
            )
        },
    })
}
