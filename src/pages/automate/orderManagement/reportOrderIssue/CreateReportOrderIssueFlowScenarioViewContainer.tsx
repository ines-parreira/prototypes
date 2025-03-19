import { Redirect } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import CreateReportOrderIssueFlowScenarioView from './CreateReportOrderIssueFlowScenarioView'

const CreateReportOrderIssueFlowScenarioViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <CreateReportOrderIssueFlowScenarioView />
}

export default CreateReportOrderIssueFlowScenarioViewContainer
