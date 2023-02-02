import React, {ReactNode, useRef, useState} from 'react'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'

import css from './AutomationNavbarAddOnPaywallNavbarLink.less'

type Props = {
    children: ReactNode
    onSubscribeToAutomationAddOnClick: () => void
} & NavbarLinkProps

const AutomationNavbarAddOnPaywallNavbarLink = ({
    children,
    onSubscribeToAutomationAddOnClick,
    ...props
}: Props) => {
    const iconRef = useRef<HTMLElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const handleSubscribeToAutomationAddOnClick = () => {
        setIsPopoverOpen(false)
        onSubscribeToAutomationAddOnClick()
    }

    return (
        <>
            <NavbarLink className={classnames(css.item)} {...props}>
                {children}
                <i
                    ref={iconRef}
                    className={classnames('material-icons md-2', css.icon)}
                    onMouseEnter={() => {
                        setIsPopoverOpen(true)
                    }}
                >
                    lock
                </i>
            </NavbarLink>
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
                        Subscribe to the Automation <br /> Add-on to unlock this
                        feature
                        <Button
                            size="small"
                            className="mt-3"
                            onClick={handleSubscribeToAutomationAddOnClick}
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

export default AutomationNavbarAddOnPaywallNavbarLink
