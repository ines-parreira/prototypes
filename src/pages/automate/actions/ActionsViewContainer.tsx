import React from 'react'

import {ErrorBoundary} from 'pages/ErrorBoundary'

import ActionsView from './ActionsView'

const ActionsViewContainer = () => (
    <ErrorBoundary sentryTags={{section: 'actions'}}>
        <ActionsView />
    </ErrorBoundary>
)

export default ActionsViewContainer
