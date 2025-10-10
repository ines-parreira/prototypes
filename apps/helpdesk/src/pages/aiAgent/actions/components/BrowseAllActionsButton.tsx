import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

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
