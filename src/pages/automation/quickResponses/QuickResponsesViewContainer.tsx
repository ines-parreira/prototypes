import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import QuickResponsesView from './QuickResponsesView'

const QuickResponsesViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <QuickResponsesView />
}

export default QuickResponsesViewContainer
