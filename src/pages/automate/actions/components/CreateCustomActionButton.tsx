import React from 'react'

import {Link, useParams} from 'react-router-dom'

import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'

export default function CreateCustomActionButton() {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <Link to={routes.newAction()}>
            <Button intent="secondary">Create Custom Action</Button>
        </Link>
    )
}
