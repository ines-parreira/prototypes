import React from 'react'

import { Link, useParams } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'

export default function BrowseAllActionsButton() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    return (
        <Link to={routes.actionsTemplates}>
            <Button>Create from template</Button>
        </Link>
    )
}
