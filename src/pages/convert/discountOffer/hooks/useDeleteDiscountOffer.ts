import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    uniqueDiscountOfferKeys,
    useDeleteDiscountOffer as usePureDeleteDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useDeleteDiscountOffer = (offerPrefix: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureDeleteDiscountOffer({
        onSuccess: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Discount code offer "${offerPrefix}" was successfully deleted. The campaigns containing this offer won’t be displayed anymore.`,
                })
            )
            return queryClient.invalidateQueries({
                queryKey: uniqueDiscountOfferKeys.all(),
            })
        },
        onError: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to delete the discount offer.',
                })
            )
        },
    })
}
