import React from 'react'

import {useParams} from 'react-router-dom'

import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import BackLink from 'pages/common/components/BackLink'

export const Level2IntentsContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <AiAgentLayout shopName={shopName}>
            <div>
                <BackLink path={routes.optimize} label="Back to Optimize" />
                <div>Level2IntentsContainer</div>
            </div>
        </AiAgentLayout>
    )
}
