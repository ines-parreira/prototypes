import React from 'react'
import {useLocation} from 'react-router-dom'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCheapestConvertPrice,
    getConvertProduct,
    getCurrentConvertProduct,
} from 'state/billing/selectors'
import {ConvertPrice, ProductType} from 'models/billing/types'

type Props = {
    canduId: string
    isOpen: boolean
    onClose: () => void
    onSubscribe: () => void
}

const ConvertSubscriptionModal = ({
    canduId,
    isOpen,
    onClose,
    onSubscribe,
}: Props) => {
    const location = useLocation()

    const currentPrice = useAppSelector(getCurrentConvertProduct)
    const cheapestPrice = useAppSelector(getCheapestConvertPrice)
    const convertPrices = useAppSelector(getConvertProduct)?.prices

    const defaultPrice: ConvertPrice | undefined = currentPrice ?? cheapestPrice
    const currentPath = location?.pathname

    return (
        <SubscriptionModal
            productType={ProductType.Convert}
            canduId={canduId}
            prices={convertPrices ?? []}
            headerDescription={'Subscribe to Convert'}
            currentPage={currentPath}
            defaultPrice={defaultPrice}
            // Convert doesn't have helpdesk trial
            isTrialingSubscription={false}
            isOpen={isOpen}
            onClose={onClose}
            onSubscribe={onSubscribe}
        />
    )
}

export default ConvertSubscriptionModal
