import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    uniqueDiscountOfferKeys,
    useUpdateDiscountOffer as usePureUpdateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useUpdateDiscountOffer = (offerPrefix: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureUpdateDiscountOffer({
        onSuccess: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Discount code offer "${offerPrefix}" was successfully updated.`,
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
                    message: 'Failed to update the discount offer.',
                })
            )
        },
    })
}
