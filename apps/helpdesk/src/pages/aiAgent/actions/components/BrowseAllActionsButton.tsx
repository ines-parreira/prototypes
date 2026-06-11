import { Link, useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export function BrowseAllActionsButton() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    return (
        <Button as={Link} to={routes.actionsTemplates}>
            Create from template
        </Button>
    )
}
