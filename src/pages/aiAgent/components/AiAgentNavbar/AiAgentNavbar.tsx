import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import navbarCss from 'assets/css/navbar.less'
import {ActiveContent, Navbar} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import {getHasAutomate} from 'state/billing/selectors'

import css from './AiAgentNavbar.less'
import {AiAgentNavbarView} from './AiAgentNavbarView'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]

    return (
        <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent">
            {(hasAutomate || hasAiAgentPreview) && (
                <>
                    <div
                        className={classNames(
                            navbarCss['link-wrapper'],
                            css.aiAgent
                        )}
                        data-candu-id="ai-agent-link-my-ai-agent"
                    >
                        <NavbarLink to="/app/ai-agent" exact>
                            <span>Overview</span>
                        </NavbarLink>
                    </div>
                    <AiAgentNavbarView />
                </>
            )}
        </Navbar>
    )
}
