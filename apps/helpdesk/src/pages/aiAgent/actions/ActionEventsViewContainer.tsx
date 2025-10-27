import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import ActionsExecutionsView from './ActionEventsView'

export default function ActionEventsViewContainer() {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{ section: 'actions-executions' }}>
            <ActionsExecutionsView />
        </ErrorBoundary>
    )
}
