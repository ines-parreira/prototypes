import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {AI_AGENT} from '../common/components/constants'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceView} from './AiAgentGuidanceView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceContainer = () => {
    const guidanceHelpCenter = useGuidanceHelpCenter()
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    if (shopType !== 'shopify' || !shopName) {
        return <Redirect to="/app/automation" />
    }

    // We don't handle for now the case when guidanceHelpCenter is not created.
    // We assume it always created after AI agent initialisation.
    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView
            title={AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            className={css.container}
        >
            <AiAgentGuidanceView
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
            />
        </AutomateView>
    )
}
