import { Link, useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export default function BackToActionButton() {
    const { shopName, id } = useParams<{
        shopName: string
        id: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <Link to={() => routes.actionEvents(id)}>
            <Button fillStyle="ghost" intent="secondary">
                View Events
            </Button>
        </Link>
    )
}
