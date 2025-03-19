import { Redirect } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'

import ActionsExecutionsView from './ActionEventsView'

export default function ActionEventsViewContainer() {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{ section: 'actions-executions' }}>
            <ActionsExecutionsView />
        </ErrorBoundary>
    )
}
