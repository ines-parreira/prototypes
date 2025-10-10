import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export default function BackToActionButton() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <Link to={routes.actions}>
            <Button
                fillStyle="ghost"
                intent="secondary"
                leadingIcon="arrow_back"
            >
                Back to Support Actions
            </Button>
        </Link>
    )
}
