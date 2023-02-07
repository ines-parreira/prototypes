import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import QuickResponsesView from './QuickResponsesView'

const QuickResponsesViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/quick-responses" />
    }

    return <QuickResponsesView />
}

export default QuickResponsesViewContainer
