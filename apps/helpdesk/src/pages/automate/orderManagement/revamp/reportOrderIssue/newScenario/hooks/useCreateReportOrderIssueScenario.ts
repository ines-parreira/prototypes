import { useCallback } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import { useReportOrderIssueFlow } from '../../scenarioList/hooks/useReportOrderIssueFlow'

export const useCreateReportOrderIssueScenario = () => {
    const history = useHistory()
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const { isUpdatePending, scenarios, handleScenariosUpdate } =
        useReportOrderIssueFlow()

    const handleScenarioCreate = useCallback(
        async (newScenario: SelfServiceReportIssueCase) => {
            await handleScenariosUpdate([newScenario, ...scenarios])
            history.push(
                `/app/settings/order-management/${shopType}/${shopName}/report-issue`,
            )
        },
        [handleScenariosUpdate, scenarios, history, shopType, shopName],
    )

    return {
        isCreatePending: isUpdatePending,
        handleScenarioCreate,
    }
}
