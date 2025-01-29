import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import navbarCss from 'assets/css/navbar.less'
import {ActiveContent, Navbar} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {getHasAutomate} from 'state/billing/selectors'

import css from './AutomateNavbar.less'
import AutomateNavbarView from './AutomateNavbarView'

const AutomateNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform
    )

    return (
        <Navbar activeContent={ActiveContent.Automate} title="Automate">
            {(hasAutomate || hasAiAgentPreview) && (
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
