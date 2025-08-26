import { Link, useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export default function BackToActionFormButton() {
    const { shopName, id } = useParams<{
        id: string
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <Link to={() => routes.editAction(id)}>
            <Button
                fillStyle="ghost"
                intent="secondary"
                leadingIcon="arrow_back"
            >
                Back to Support Action
            </Button>
        </Link>
    )
}
