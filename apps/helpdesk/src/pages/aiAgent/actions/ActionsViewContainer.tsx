import {
    isAtLeastMilestone,
    useActionCentralizedLibraryEnabled,
} from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import ActionLibraryView from 'pages/aiAgent/actionsV2/ActionLibraryView'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import ActionsView from './ActionsView'

const ActionsViewContainer = () => {
    const { milestone } = useActionCentralizedLibraryEnabled()
    const showV2 = isAtLeastMilestone(milestone, 'MILESTONE-2')

    return (
        <ErrorBoundary
            sentryTags={{ section: showV2 ? 'actionsV2' : 'actions' }}
        >
            {showV2 ? <ActionLibraryView /> : <ActionsView />}
        </ErrorBoundary>
    )
}

export default ActionsViewContainer
