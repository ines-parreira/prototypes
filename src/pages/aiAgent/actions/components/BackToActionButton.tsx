import { Link, useParams } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'

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
