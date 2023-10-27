import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCheapestConvertPrice,
    getConvertProduct,
    getCurrentConvertProduct,
    getCurrentHelpdeskProduct,
} from 'state/billing/selectors'
import {ConvertPrice, ProductType} from 'models/billing/types'
import CanduActionInfobar from 'pages/settings/new_billing/components/CanduActionInfobar'
import {getDefaultConvertPriceIndex} from '../../utils/getDefaultConvertPriceIndex'
import css from './ConvertSubscriptionModal.less'

type Props = {
    canduId: string
    isOpen: boolean
    redirectPath?: string
    onClose: () => void
    onSubscribe: () => void
}

const ConvertSubscriptionModal = ({
    canduId,
    isOpen,
    onClose,
    onSubscribe,
    redirectPath,
}: Props) => {
    const location = useLocation()

    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const currentPrice = useAppSelector(getCurrentConvertProduct)
    const cheapestPrice = useAppSelector(getCheapestConvertPrice)
    const convertPrices = useAppSelector(getConvertProduct)?.prices

    const defaultPrice = useMemo((): ConvertPrice | undefined => {
        const convertInitialIndex = getDefaultConvertPriceIndex(
            convertPrices,
            helpdeskProduct?.name
        )

        if (convertInitialIndex === -1) {
            return currentPrice ?? cheapestPrice
        }

        return convertPrices?.[convertInitialIndex]
    }, [convertPrices, currentPrice, cheapestPrice, helpdeskProduct])

    const currentPath = redirectPath || location?.pathname

    const bookDemoInfobar = useMemo(() => {
        // TODO: we should allow to display it once we have the link
        const shouldDisplay = false
        const onClick = () => {
            window.open('http://google.com', '_blank', 'noopener')
        }

        return (
            shouldDisplay && (
                <div className={css.demoContainer}>
                    <CanduActionInfobar
                        canduId={'convert-book-demo-infobar'}
                        btnLabel={'Book a demo'}
                        text={
                            'See how features like Convert can be personalized for your account'
                        }
                        onClick={onClick}
                    />
                </div>
            )
        )
    }, [])

    return (
        <SubscriptionModal
            productType={ProductType.Convert}
            canduId={canduId}
            prices={convertPrices ?? []}
            headerDescription={'Subscribe to Convert'}
            tagline={'Ready to boost sales with Convert?'}
            currentPage={currentPath}
            defaultPrice={defaultPrice}
            // Convert doesn't have helpdesk trial
            isTrialingSubscription={false}
            isOpen={isOpen}
            onClose={onClose}
            onSubscribe={onSubscribe}
            topModalComponent={bookDemoInfobar}
        />
    )
}

export default ConvertSubscriptionModal
