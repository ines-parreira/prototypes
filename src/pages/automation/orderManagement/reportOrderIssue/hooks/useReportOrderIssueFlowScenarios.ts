import {useCallback, useMemo} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceReportIssueCase} from 'models/selfServiceConfiguration/types'

const useReportOrderIssueFlowScenarios = (shopName: string) => {
    const {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleScenariosUpdate = useCallback(
        (
            scenarios: SelfServiceReportIssueCase[],
            messages: {success?: string; error?: string} = {}
        ) => {
            if (!selfServiceConfiguration) {
                return
            }

            return handleSelfServiceConfigurationUpdate(
                {
                    ...selfServiceConfiguration,
                    report_issue_policy: {
                        ...selfServiceConfiguration.report_issue_policy,
                        cases: scenarios,
                    },
                },
                messages
            )
        },
        [selfServiceConfiguration, handleSelfServiceConfigurationUpdate]
    )
    const scenarios = useMemo(
        () => selfServiceConfiguration?.report_issue_policy?.cases ?? [],
        [selfServiceConfiguration?.report_issue_policy?.cases]
    )

    return {
        isFetchPending,
        isUpdatePending,
        scenarios,
        selfServiceConfiguration,
        handleScenariosUpdate,
    }
}

export default useReportOrderIssueFlowScenarios
