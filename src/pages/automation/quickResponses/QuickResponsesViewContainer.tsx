import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import CanduContent from 'pages/onboarding/CanduContent'

import QuickResponsesView from './QuickResponsesView'

const QuickResponsesViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return (
            <CanduContent
                containerId="candu-quick-responses"
                title="Quick responses"
            />
        )
    }

    return <QuickResponsesView />
}

export default QuickResponsesViewContainer
