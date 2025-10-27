import { Redirect } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import ActionTemplatesView from './ActionTemplatesView'

const ActionsTemplatesViewContainer = () => {
    const { hasAccess } = useAiAgentAccess()

    if (!hasAccess) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{ section: 'actions-templates' }}>
            <ActionTemplatesView />
        </ErrorBoundary>
    )
}

export default ActionsTemplatesViewContainer
