import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'

import navbarCss from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Navbar from 'pages/common/components/Navbar'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'

import AutomateNavbarView from './AutomateNavbarView'
import css from './AutomateNavbar.less'

const AutomateNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )
    const isNewLandingPageVisible: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateLandingPage]

    return (
        <Navbar activeContent="automate">
            {(hasAutomate || hasLegacyAutomateFeatures) && (
                <>
                    {isNewLandingPageVisible && (
                        <div
                            className={classNames(
                                navbarCss['link-wrapper'],
                                css.automate
                            )}
                            data-candu-id="automate-link-my-automate"
                        >
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
            )}
        </Navbar>
    )
}

export default AutomateNavbar
