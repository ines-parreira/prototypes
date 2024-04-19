import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {AI_AGENT} from '../common/components/constants'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AiAgentNewGuidanceView} from './AiAgentNewGuidanceView'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'

export const AiAgentNewGuidanceContainer = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const guidanceHelpCenter = useGuidanceHelpCenter()
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    if (shopType !== 'shopify' || !shopName) {
        return <Redirect to="/app/automation" />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <AiAgentNewGuidanceView
                shopName={shopName}
                helpCenter={guidanceHelpCenter}
            />
        </AutomateView>
    )
}
