import { ErrorBoundary } from 'pages/ErrorBoundary'

import ActionTemplatesView from './ActionTemplatesView'

const ActionsTemplatesViewContainer = () => {
    return (
        <ErrorBoundary sentryTags={{ section: 'actions-templates' }}>
            <ActionTemplatesView />
        </ErrorBoundary>
    )
}

export default ActionsTemplatesViewContainer
