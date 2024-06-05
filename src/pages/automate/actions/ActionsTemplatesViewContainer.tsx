import React from 'react'

import {Redirect} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {ErrorBoundary} from 'pages/ErrorBoundary'
import ActionTemplatesView from './ActionTemplatesView'

const ActionsTemplatesViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{section: 'actions-templates'}}>
            <ActionTemplatesView />
        </ErrorBoundary>
    )
}

export default ActionsTemplatesViewContainer
