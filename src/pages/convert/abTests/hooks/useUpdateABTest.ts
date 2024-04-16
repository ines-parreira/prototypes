import {useQueryClient} from '@tanstack/react-query'

import {
    useUpdateABTest as usePureUpdateABTest,
    abTestKeys,
} from 'models/convert/abTest/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

export const useUpdateABTest = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureUpdateABTest({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: abTestKeys.lists(),
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B Test successfully updated',
                })
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update the A/B Test',
                })
            ),
    })
}
