import React from 'react'
import {useParams} from 'react-router-dom'

import Spinner from 'pages/common/components/Spinner'

import {AiAgentGuidanceAiSuggestionNewView} from './AiAgentGuidanceAiSuggestionNewView'
import css from './AiAgentGuidanceContainer.less'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
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
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
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
