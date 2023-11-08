import React, {useCallback, useMemo, useRef, useState} from 'react'
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

    const isConvertSubscriber = useIsConvertSubscriber()

    const handeIconMouseEnter = useCallback(() => {
        !isConvertSubscriber && setIsPopoverOpen(true)
    }, [isConvertSubscriber])

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
        const tagline = (
            <>
                Subscribe to Convert
                <br /> to unlock this product
            </>
        )
        return (
            <PaywallPopover
                featureName="Convert"
                iconRef={iconRef}
                onButtonClick={() => setISubscriptionModalOpen(true)}
                isOpened={isPopoverOpen}
                setIsOpened={setIsPopoverOpen}
                tagline={tagline}
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
            !isConvertSubscriber && (
                <>
                    {popoverComponent}
                    {subscriptionModalComponent}
                </>
            )
        )
    }, [isConvertSubscriber, popoverComponent, subscriptionModalComponent])

    return useMemo(() => {
        const links: CategoryLink[] = [
            {
                requiredRole: ADMIN_ROLE,
                to: 'convert/click-tracking',
                text: 'Click Tracking',
                extra: iconComponent,
                outerExtra: outerExtra,
            },
        ]

        if (isConvertSubscriber) {
            links.push({
                requiredRole: ADMIN_ROLE,
                to: 'convert/installations',
                text: 'Installations',
            })
        }

        return links
    }, [isConvertSubscriber, iconComponent, outerExtra])
}

export default useGetConvertLinks
