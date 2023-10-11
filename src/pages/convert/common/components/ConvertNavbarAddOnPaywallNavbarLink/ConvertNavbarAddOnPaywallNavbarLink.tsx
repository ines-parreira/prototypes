import React, {ReactNode, useRef, useState} from 'react'
import {Popover, PopoverBody} from 'reactstrap'

import classNames from 'classnames'
import cssNavbar from 'assets/css/navbar.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'

import css from 'pages/convert/common/components/ConvertNavbarAddOnPaywallNavbarLink/ConvertNavbarAddOnPaywallNavbarLink.less'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'

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
            {iconRef.current && (
                <Popover
                    placement="top"
                    isOpen={isPopoverOpen}
                    toggle={() => {
                        setIsPopoverOpen(!isPopoverOpen)
                    }}
                    target={iconRef.current}
                    trigger="focus hover"
                    boundariesElement="window"
                >
                    <PopoverBody className="d-flex p-3 flex-column align-items-center">
                        Subscribe to the {addonName} <br /> to unlock this
                        feature
                        <Button
                            size="small"
                            className="mt-3"
                            onClick={handleSubscribeToAddOnClick}
                        >
                            <ButtonIconLabel icon="auto_awesome">
                                Get This Feature
                            </ButtonIconLabel>
                        </Button>
                    </PopoverBody>
                </Popover>
            )}
        </>
    )
}

export default ConvertNavbarAddOnPaywallNavbarLink
