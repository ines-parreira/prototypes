import React, {useCallback, useRef, useState} from 'react'

import {Popover, PopoverBody} from 'reactstrap'
import navbarCss from 'assets/css/navbar.less'

import useAppSelector from 'hooks/useAppSelector'
import Navbar from 'pages/common/components/Navbar'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {hasAgentPrivileges} from 'utils'
import {useIsAutomateRebranding} from 'pages/automation/common/hooks/useIsAutomateRebranding'
import AutomationNavbarAddOnPaywallView from './AutomationNavbarAddOnPaywallView'
import AutomationNavbarAddOnView from './AutomationNavbarAddOnView'
import css from './AutomationNavbar.less'

type MenuItem = {
    label: string
    link: string
    settingsLink: string
    tooltipLabel: string
}

const MenuItem = ({menu}: {menu: MenuItem}) => {
    const {link, label, settingsLink, tooltipLabel} = menu
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const {isAutomateRebranding} = useIsAutomateRebranding()
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
        (event) => {
            isAutomateRebranding && event.preventDefault()
        },
        [isAutomateRebranding]
    )
    return (
        <div>
            <Popover
                placement="top"
                isOpen={isPopoverOpen}
                toggle={() => {
                    setIsPopoverOpen(!isPopoverOpen)
                }}
                target={ref}
                trigger="focus hover"
                className={css.popoverContainer}
                boundariesElement="window"
            >
                <PopoverBody>
                    {tooltipLabel}
                    <u>
                        <a href={settingsLink}>Settings menu</a>
                    </u>
                    .
                </PopoverBody>
            </Popover>

            <div
                className={navbarCss['link-wrapper']}
                onMouseEnter={() => {
                    isAutomateRebranding && setIsPopoverOpen(true)
                }}
                ref={ref}
            >
                <NavbarLink onClick={handleClick} to={link}>
                    {label}
                </NavbarLink>
            </div>
        </div>
    )
}

const AutomationNavbar = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    const menus = [
        {
            label: 'Macros',
            link: '/app/automation/macros',
            settingsLink: '/app/settings/macros',
            tooltipLabel: 'Macros have moved to the ',
        },
        {
            label: 'Rules',
            link: '/app/automation/rules',
            settingsLink: '/app/settings/rules',
            tooltipLabel: 'Rules have moved to the ',
        },
        {
            label: 'Ticket assignment',
            link: '/app/automation/ticket-assignment',
            settingsLink: '/app/settings/ticket-assignment',
            tooltipLabel: 'Ticket assignment has moved to the ',
        },
    ]
    return (
        <Navbar activeContent="automate">
            <div className={navbarCss.category}>
                {menus.map((menu: MenuItem, idx) => (
                    <MenuItem menu={menu} key={idx} />
                ))}
            </div>

            {hasAgentPrivileges(currentUser) &&
                (hasAutomationAddOn || hasLegacyAutomationAddOnFeatures ? (
                    <AutomationNavbarAddOnView />
                ) : (
                    <AutomationNavbarAddOnPaywallView />
                ))}
        </Navbar>
    )
}

export default AutomationNavbar
