import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {ActiveContent, Navbar} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {AiAgentNavbarView} from './AiAgentNavbarView'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]

    return (
        <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent">
            {(hasAutomate || hasAiAgentPreview) && <AiAgentNavbarView />}
        </Navbar>
    )
}
