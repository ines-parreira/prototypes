import { Link, useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export default function CreateCustomActionButton() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <Link to={routes.newAction()}>
            <Button intent="secondary">Create Custom Action</Button>
        </Link>
    )
}
