import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import EditReportOrderIssueFlowScenarioView from './EditReportOrderIssueFlowScenarioView'

const EditReportOrderIssueFlowScenarioViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <EditReportOrderIssueFlowScenarioView />
}

export default EditReportOrderIssueFlowScenarioViewContainer
