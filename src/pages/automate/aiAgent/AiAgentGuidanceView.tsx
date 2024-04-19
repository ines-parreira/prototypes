import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {useGuidanceArticles} from './hooks/useGuidanceArticles'
import {GuidanceEmptyState} from './components/GuidanceEmptyState/GuidanceEmptyState'

type Props = {
    helpCenterId: number
    shopName: string
}

export const AiAgentGuidanceView = ({helpCenterId, shopName}: Props) => {
    const {guidanceArticles, isArticleListLoading} =
        useGuidanceArticles(helpCenterId)

    if (isArticleListLoading) {
        return <Loader />
    }

    const isEmptyState = !guidanceArticles || guidanceArticles.length === 0

    if (isEmptyState) {
        return <GuidanceEmptyState shopName={shopName} />
    }

    return <div>AI Agent Guidance</div>
}
