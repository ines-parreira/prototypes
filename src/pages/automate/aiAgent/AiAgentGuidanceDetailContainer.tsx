import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AiAgentGuidanceDetailView} from './AiAgentGuidanceDetailView'

export const AiAgentGuidanceDetailContainer = () => {
    const {shopName, articleId} =
        useParams<{shopName: string; articleId: string}>()
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})
    const {headerNavbarItems, routes} = useAiAgentNavigation({shopName})

    const guidanceArticleId = Number(articleId)

    if (isNaN(guidanceArticleId)) {
        return <Redirect to={routes.guidance} />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <AiAgentGuidanceDetailView
                shopName={shopName}
                locale={guidanceHelpCenter.default_locale}
                guidanceArticleId={guidanceArticleId}
                guidanceHelpCenterId={guidanceHelpCenter.id}
            />
        </AutomateView>
    )
}
