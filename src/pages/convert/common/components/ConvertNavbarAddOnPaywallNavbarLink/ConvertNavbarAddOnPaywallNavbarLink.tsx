import React, {ReactNode, useRef, useState} from 'react'

import classNames from 'classnames'
import cssNavbar from 'assets/css/navbar.less'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'

import css from 'pages/convert/common/components/ConvertNavbarAddOnPaywallNavbarLink/ConvertNavbarAddOnPaywallNavbarLink.less'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import PaywallPopover from 'pages/settings/new_billing/components/PaywallPopover'

type Props = {
    children: ReactNode
    onSubscribeToAddOnClick: () => void
} & NavbarLinkProps

const ConvertNavbarAddOnPaywallNavbarLink = ({
    children,
    onSubscribeToAddOnClick,
    ...props
}: Props) => {
    const iconRef = useRef<HTMLElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    // Common component between Convert and Automation can be extracted,
    // this and the wrapper CSS styles are the differing parts
    const addonName = 'Convert'

    const handleSubscribeToAddOnClick = () => {
        setIsPopoverOpen(false)
        onSubscribeToAddOnClick()
    }

    const tagline = (
        <>
            Subscribe to Convert
            <br /> to unlock this product
        </>
    )

    return (
        <>
            <div
                className={classNames(
                    cssNavbar['link-wrapper'],
                    cssNavbar.isNested
                )}
            >
                <NavbarLink className={css.item} {...props}>
                    <div className={css.name}>{children}</div>

                    <UpgradeIcon
                        iconRef={iconRef}
                        onMouseEnter={() => {
                            setIsPopoverOpen(true)
                        }}
                    />
                </NavbarLink>
            </div>
            <PaywallPopover
                featureName={addonName}
                iconRef={iconRef}
                onButtonClick={handleSubscribeToAddOnClick}
                isOpened={isPopoverOpen}
                setIsOpened={setIsPopoverOpen}
                tagline={tagline}
            />
        </>
    )
}

export default ConvertNavbarAddOnPaywallNavbarLink
