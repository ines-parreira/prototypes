import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import Loader from 'pages/common/components/Loader/Loader'

import {AiAgentGuidanceDetailView} from './AiAgentGuidanceDetailView'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'

export const AiAgentGuidanceDetailContainer = () => {
    const {shopName, articleId} = useParams<{
        shopName: string
        articleId: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const {routes} = useAiAgentNavigation({shopName})

    const guidanceArticleId = Number(articleId)

    if (isNaN(guidanceArticleId)) {
        return <Redirect to={routes.guidance} />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentGuidanceDetailView
            shopName={shopName}
            locale={guidanceHelpCenter.default_locale}
            guidanceArticleId={guidanceArticleId}
            guidanceHelpCenterId={guidanceHelpCenter.id}
        />
    )
}
