import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AiAgentGuidanceNewView} from './AiAgentGuidanceNewView'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'

export const AiAgentGuidanceNewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            headerNavbarItems={headerNavbarItems}
        >
            <AiAgentGuidanceNewView
                shopName={shopName}
                helpCenter={guidanceHelpCenter}
            />
        </AutomateView>
    )
}
