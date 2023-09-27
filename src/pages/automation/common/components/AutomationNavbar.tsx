import React from 'react'
import classNames from 'classnames'

import navbarCss from 'assets/css/navbar.less'

import useAppSelector from 'hooks/useAppSelector'
import Navbar from 'pages/common/components/Navbar'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {hasAgentPrivileges} from 'utils'

import AutomationNavbarAddOnPaywallView from './AutomationNavbarAddOnPaywallView'
import AutomationNavbarAddOnView from './AutomationNavbarAddOnView'

const AutomationNavbar = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    return (
        <Navbar activeContent="automation">
            <div
                className={classNames(
                    navbarCss.category,
                    navbarCss['link-wrapper']
                )}
            >
                <NavbarLink to="/app/automation/macros">Macros</NavbarLink>
            </div>
            <div className={navbarCss['link-wrapper']}>
                <NavbarLink to="/app/automation/rules">Rules</NavbarLink>
            </div>

            <div className={navbarCss['link-wrapper']}>
                <NavbarLink to="/app/automation/ticket-assignment">
                    Ticket assignment
                </NavbarLink>
            </div>
            {hasAgentPrivileges(currentUser) && (
                <NavbarBlock icon="auto_awesome" title="automation add-on">
                    {hasAutomationAddOn || hasLegacyAutomationAddOnFeatures ? (
                        <AutomationNavbarAddOnView />
                    ) : (
                        <AutomationNavbarAddOnPaywallView />
                    )}
                </NavbarBlock>
            )}
        </Navbar>
    )
}

export default AutomationNavbar
