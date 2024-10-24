import {useQueryClient} from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useCreateABTest as usePureCreateABTest,
    abTestKeys,
} from 'models/convert/abTest/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useCreateABTest = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateABTest({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: abTestKeys.lists(),
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B Test successfully started',
                })
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to start the A/B Test',
                })
            ),
    })
}
