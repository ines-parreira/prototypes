import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import EditReportOrderIssueFlowScenarioView from './EditReportOrderIssueFlowScenarioView'

const EditReportOrderIssueFlowScenarioViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <EditReportOrderIssueFlowScenarioView />
}

export default EditReportOrderIssueFlowScenarioViewContainer
