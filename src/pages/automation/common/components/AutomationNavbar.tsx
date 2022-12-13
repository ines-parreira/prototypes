import React from 'react'

import css from 'assets/css/navbar.less'

import {hasAgentPrivileges, isAdmin} from 'utils'
import Navbar from 'pages/common/components/Navbar'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'

import AutomationNavbarAddOnView from './AutomationNavbarAddOnView'
import AutomationNavbarAddOnPaywallView from './AutomationNavbarAddOnPaywallView'

const AutomationNavbar = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomationAddOnFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )

    return (
        <Navbar activeContent="automation">
            <div className={css.category}>
                <NavbarLink to="/app/automation" exact>
                    Overview
                </NavbarLink>
            </div>
            {hasAgentPrivileges(currentUser) && (
                <NavbarLink to="/app/automation/macros">Macros</NavbarLink>
            )}
            {hasAgentPrivileges(currentUser) && (
                <NavbarLink to="/app/automation/rules">Rules</NavbarLink>
            )}
            {isAdmin(currentUser) && (
                <NavbarLink to="/app/automation/ticket-assignment">
                    Ticket assignment
                </NavbarLink>
            )}
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
