import React from 'react'

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
import {FeatureFlagKey} from 'config/featureFlags'
import AutomateNavbarPaywallView from './AutomateNavbarPaywallView'
import AutomateNavbarView from './AutomateNavbarView'

const AutomateNavbar = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )
    const isNewLandingPageVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateLandingPage]

    return (
        <Navbar activeContent="automate">
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
