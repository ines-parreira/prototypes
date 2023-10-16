import React, {useCallback, useMemo, useRef, useState} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {isStarterTierPrice} from 'models/billing/utils'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import PaywallPopover from 'pages/settings/new_billing/components/PaywallPopover'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
import {CategoryLink} from 'pages/settings/common/SettingsNavbar'
import {ADMIN_ROLE} from 'config/user'

const useGetConvertLinks = (): CategoryLink[] => {
    const iconRef = useRef<HTMLElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isSubscriptionModalOpen, setISubscriptionModalOpen] = useState(false)

    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const isStarterPlan = isStarterTierPrice(helpdeskPrice)
    const isConvertSubscriber = useIsConvertSubscriber()

    const isDirectlyUpgradable = useMemo(() => {
        return !isConvertSubscriber && !isStarterPlan
    }, [isConvertSubscriber, isStarterPlan])

    const handeIconMouseEnter = useCallback(() => {
        isDirectlyUpgradable && setIsPopoverOpen(true)
    }, [isDirectlyUpgradable])

    const iconComponent = useMemo(() => {
        return (
            !isConvertSubscriber && (
                <UpgradeIcon
                    iconRef={iconRef}
                    onMouseEnter={handeIconMouseEnter}
                />
            )
        )
    }, [isConvertSubscriber, iconRef, handeIconMouseEnter])

    const popoverComponent = useMemo(() => {
        return (
            <PaywallPopover
                featureName="Convert"
                iconRef={iconRef}
                onButtonClick={() => setISubscriptionModalOpen(true)}
                isOpened={isPopoverOpen}
                setIsOpened={setIsPopoverOpen}
            />
        )
    }, [isPopoverOpen])

    const subscriptionModalComponent = useMemo(() => {
        return (
            <ConvertSubscriptionModal
                canduId={'campaign-list-convert-modal-body'}
                isOpen={isSubscriptionModalOpen}
                onClose={() => setISubscriptionModalOpen(false)}
                onSubscribe={() => setISubscriptionModalOpen(false)}
            />
        )
    }, [isSubscriptionModalOpen])

    const outerExtra = useMemo(() => {
        return (
            isDirectlyUpgradable && (
                <>
                    {popoverComponent}
                    {subscriptionModalComponent}
                </>
            )
        )
    }, [isDirectlyUpgradable, popoverComponent, subscriptionModalComponent])

    return useMemo(() => {
        return [
            {
                requiredRole: ADMIN_ROLE,
                to: 'revenue/click-tracking',
                text: 'Click Tracking',
                extra: iconComponent,
                outerExtra: outerExtra,
            },
        ]
    }, [iconComponent, outerExtra])
}

export default useGetConvertLinks
