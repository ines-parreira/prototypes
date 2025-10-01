import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'

import navbarCss from 'assets/css/navbar.less'
import { ActiveContent, Navbar } from 'common/navigation'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import { getHasAutomate } from 'state/billing/selectors'

import AutomateNavbarView from './AutomateNavbarView'

import css from './AutomateNavbar.less'

const AutomateNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview = useFlag(FeatureFlagKey.AIAgentPreviewModeAllowed)
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )

    return (
        <Navbar activeContent={ActiveContent.Automate} title="AI Agent">
            {(hasAutomate || hasAiAgentPreview) && (
                <>
                    <div
                        className={classNames(
                            navbarCss['link-wrapper'],
                            css.automate,
                        )}
                        data-candu-id="automate-link-my-automate"
                    >
                        <NavbarLink to="/app/automation" exact>
                            <span>Overview</span>
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            navbarCss['link-wrapper'],
                            css.navbarItem,
                        )}
                    >
                        <NavbarLink
                            to="/app/automation/ai-agent-overview"
                            exact
                        >
                            <span>AI Agent Overview</span>
                        </NavbarLink>
                    </div>
                    {isActionsInternalPlatformEnabled && (
                        <div className={navbarCss['link-wrapper']}>
                            <NavbarLink to="/app/ai-agent/actions-platform">
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
