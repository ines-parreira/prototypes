import { useCallback, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'

export const useReportOrderIssueFlow = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const scenarios = useMemo(
        () => selfServiceConfiguration?.reportIssuePolicy?.cases ?? [],
        [selfServiceConfiguration?.reportIssuePolicy?.cases],
    )

    const handleScenariosUpdate = useCallback(
        (
            updatedScenarios: SelfServiceReportIssueCase[],
            messages: { success?: string; error?: string } = {},
        ) => {
            return handleSelfServiceConfigurationUpdate((draft) => {
                draft.reportIssuePolicy.cases = updatedScenarios
            }, messages)
        },
        [handleSelfServiceConfigurationUpdate],
    )

    const isLoading = isFetchPending || !selfServiceConfiguration

    return {
        isLoading,
        isUpdatePending,
        scenarios,
        handleScenariosUpdate,
    }
}
