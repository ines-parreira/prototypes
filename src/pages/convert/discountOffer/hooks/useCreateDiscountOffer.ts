import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    uniqueDiscountOfferKeys,
    useCreateDiscountOffer as usePureCreateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useCreateDiscountOffer = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateDiscountOffer({
        onSuccess: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Discount Offer successfully created.',
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
                    message: 'Failed to create the discount offer.',
                })
            )
        },
    })
}
