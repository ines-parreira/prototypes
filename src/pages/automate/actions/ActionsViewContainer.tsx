import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {ErrorBoundary} from 'pages/ErrorBoundary'
import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import ActionsView from './ActionsView'

const TrainMyAiViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return (
        <ErrorBoundary sentryTags={{section: 'actions'}}>
            <ActionsView />
        </ErrorBoundary>
    )
}

export default TrainMyAiViewContainer
