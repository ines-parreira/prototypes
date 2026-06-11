import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useActionsLabel } from 'pages/aiAgent/hooks/useActionsLabel'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export function BackToActionButton() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const actionsLabel = useActionsLabel()

    return (
        <Link to={routes.actions}>
            <Button
                fillStyle="ghost"
                intent="secondary"
                leadingIcon="arrow_back"
            >
                Back to {actionsLabel}
            </Button>
        </Link>
    )
}
