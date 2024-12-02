import React from 'react'

import {useParams} from 'react-router-dom'

import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'

export const OptimizeContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const {routes} = useAiAgentNavigation({shopName})

    return (
        <AiAgentLayout shopName={shopName}>
            <div>
                <div>OptimizeContainer</div>
                <button
                    onClick={() => {
                        history.push(routes.optimizeIntent('intentId'))
                    }}
                >
                    Click me
                </button>
            </div>
        </AiAgentLayout>
    )
}
