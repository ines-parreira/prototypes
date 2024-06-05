import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {AiAgentGuidanceNewView} from './AiAgentGuidanceNewView'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

export const AiAgentGuidanceNewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentLayout
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            shopName={shopName}
        >
            <AiAgentGuidanceNewView
                shopName={shopName}
                helpCenter={guidanceHelpCenter}
            />
        </AiAgentLayout>
    )
}
