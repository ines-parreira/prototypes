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
import {useFlag} from 'common/flags'

import AutomateNavbarView from './AutomateNavbarView'
import css from './AutomateNavbar.less'

const AutomateNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
        false
    )

    return (
        <Navbar activeContent="automate">
            {(hasAutomate || hasLegacyAutomateFeatures) && (
                <>
                    <div
                        className={classNames(
                            navbarCss['link-wrapper'],
                            css.automate
                        )}
                        data-candu-id="automate-link-my-automate"
                    >
                        <NavbarLink to="/app/automation" exact>
                            {isImprovedNavigationEnabled ? (
                                <span>Overview</span>
                            ) : (
                                <span className={navbarCss['item-name']}>
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            navbarCss.icon
                                        )}
                                    >
                                        bolt
                                    </i>{' '}
                                    My Automate
                                </span>
                            )}
                        </NavbarLink>
                    </div>
                    {isActionsInternalPlatformEnabled && (
                        <div className={navbarCss['link-wrapper']}>
                            <NavbarLink to="/app/automation/actions-platform">
                                <span>Actions platform</span>
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
