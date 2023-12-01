import React, {useCallback, useRef, useState} from 'react'

import {Popover, PopoverBody} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'
import navbarCss from 'assets/css/navbar.less'

import useAppSelector from 'hooks/useAppSelector'
import Navbar from 'pages/common/components/Navbar'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'
import {hasAgentPrivileges} from 'utils'
import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import {FeatureFlagKey} from 'config/featureFlags'
import AutomateNavbarPaywallView from './AutomateNavbarPaywallView'
import AutomateNavbarView from './AutomateNavbarView'
import css from './AutomateNavbar.less'

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
                <NavbarLink
                    className={css.disabled}
                    onClick={handleClick}
                    to={link}
                >
                    {label}
                </NavbarLink>
            </div>
        </div>
    )
}

const AutomateNavbar = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )
    const isNewLandingPageVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateLandingPage]

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
                (hasAutomate || hasLegacyAutomateFeatures ? (
                    <>
                        {isNewLandingPageVisible && (
                            <div className={navbarCss['link-wrapper']}>
                                <NavbarLink to="/app/automation" exact>
                                    <span>
                                        <i className="material-icons mr-2 icon">
                                            bolt
                                        </i>{' '}
                                        My Automate
                                    </span>
                                </NavbarLink>
                            </div>
                        )}
                        <AutomateNavbarView />
                    </>
                ) : (
                    <AutomateNavbarPaywallView />
                ))}
        </Navbar>
    )
}

export default AutomateNavbar
