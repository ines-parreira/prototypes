import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import {AiAgentGuidanceAiSuggestionNewView} from './AiAgentGuidanceAiSuggestionNewView'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'

export const AiAgentGuidanceAiSuggestionNewContainer = () => {
    const {shopName, aiGuidanceId} = useParams<{
        shopName: string
        aiGuidanceId: string
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
            <AiAgentGuidanceAiSuggestionNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                aiGuidanceId={aiGuidanceId}
            />
        </AiAgentLayout>
    )
}
