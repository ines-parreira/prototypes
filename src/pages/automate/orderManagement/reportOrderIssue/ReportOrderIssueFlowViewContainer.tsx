import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import ReportOrderIssueFlowView from './ReportOrderIssueFlowView'

const ReportOrderIssueFlowViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <ReportOrderIssueFlowView />
}

export default ReportOrderIssueFlowViewContainer
