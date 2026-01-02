import React, { useMemo } from 'react'

import { useLocation } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import type { ConvertPlan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import css from 'pages/convert/common/components/ConvertSubscriptionModal/ConvertSubscriptionModal.less'
import CanduActionInfobar from 'pages/settings/new_billing/components/CanduActionInfobar'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import { getDefaultConvertPlanIndex } from 'pages/settings/new_billing/utils/getDefaultConvertPlanIndex'
import {
    getAvailableConvertPlans,
    getCheapestConvertPlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { isTrialing } from 'state/currentAccount/selectors'

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

    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const cheapestConvertPlan = useAppSelector(getCheapestConvertPlan)
    const convertAvailablePlans = useAppSelector(getAvailableConvertPlans)
    const isTrialingSubscription = useAppSelector(isTrialing)

    const defaultConvertPlan = useMemo((): ConvertPlan | undefined => {
        const convertInitialIndex = getDefaultConvertPlanIndex(
            currentHelpdeskPlan?.cadence,
            convertAvailablePlans,
            currentHelpdeskPlan?.name,
        )

        if (convertInitialIndex === -1) {
            return currentConvertPlan ?? cheapestConvertPlan
        }

        return convertAvailablePlans?.[convertInitialIndex]
    }, [
        convertAvailablePlans,
        currentConvertPlan,
        cheapestConvertPlan,
        currentHelpdeskPlan,
    ])

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
            availablePlans={convertAvailablePlans ?? []}
            headerDescription={'Subscribe to Convert'}
            tagline={'Ready to boost sales with Convert?'}
            currentPage={currentPath}
            defaultPlan={defaultConvertPlan}
            isTrialingSubscription={isTrialingSubscription}
            isOpen={isOpen}
            onClose={onClose}
            onSubscribe={onSubscribe}
            topModalComponent={bookDemoInfobar}
            trackingSource="subscription_modal_convert"
        />
    )
}

export default ConvertSubscriptionModal
