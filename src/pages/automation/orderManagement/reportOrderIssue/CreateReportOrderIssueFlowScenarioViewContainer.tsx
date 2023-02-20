import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import CreateReportOrderIssueFlowScenarioView from './CreateReportOrderIssueFlowScenarioView'

const CreateReportOrderIssueFlowScenarioViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <CreateReportOrderIssueFlowScenarioView />
}

export default CreateReportOrderIssueFlowScenarioViewContainer
