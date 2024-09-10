import React from 'react'

import {Link, useParams} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'

export default function BackToActionButton() {
    const {shopName, id} = useParams<{
        shopName: string
        id: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <Link to={() => routes.actionEvents(id)}>
            <Button fillStyle="ghost" intent="secondary">
                View Action Events
            </Button>
        </Link>
    )
}
