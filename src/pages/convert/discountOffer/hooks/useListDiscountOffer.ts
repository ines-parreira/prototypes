import useAppDispatch from 'hooks/useAppDispatch'
import { useListDiscountOffers as usePureListDiscountOffers } from 'models/convert/discountOffer/queries'
import { UniqueDiscountListParams } from 'models/convert/discountOffer/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useListDiscountOffers = (params: UniqueDiscountListParams) => {
    const dispatch = useAppDispatch()

    return usePureListDiscountOffers(params, {
        onError: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: "Couldn't fetch discount offers.",
                }),
            )
        },
    })
}
