import { useCallback, useMemo } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { useHistory } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

const useReportOrderIssueFlowScenarios = (shopName: string) => {
    const history = useHistory()
    const {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const scenarios = useMemo(
        () => selfServiceConfiguration?.reportIssuePolicy?.cases ?? [],
        [selfServiceConfiguration?.reportIssuePolicy?.cases],
    )

    const handleScenariosUpdate = useCallback(
        (
            scenarios: SelfServiceReportIssueCase[],
            messages: { success?: string; error?: string } = {},
        ) => {
            return handleSelfServiceConfigurationUpdate((draft) => {
                draft.reportIssuePolicy.cases = scenarios
            }, messages)
        },
        [handleSelfServiceConfigurationUpdate],
    )
    const [{ loading: isCreatePending }, handleScenarioCreate] = useAsyncFn(
        async (scenario: SelfServiceReportIssueCase) => {
            await handleScenariosUpdate([scenario, ...scenarios], {
                success: 'Successfully created',
                error: 'Failed to create',
            })

            history.push(
                `/app/automation/shopify/${shopName}/order-management/report-issue`,
            )
        },
        [scenarios, handleScenariosUpdate, history, shopName],
    )

    return {
        isFetchPending,
        isUpdatePending,
        isCreatePending,
        scenarios,
        storeIntegration,
        selfServiceConfiguration,
        handleScenariosUpdate,
        handleScenarioCreate,
        handleSelfServiceConfigurationUpdate,
    }
}

export default useReportOrderIssueFlowScenarios
