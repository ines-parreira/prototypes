import { useCallback } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import { useReportOrderIssueFlow } from '../../scenarioList/hooks/useReportOrderIssueFlow'

export const useEditReportOrderIssueScenario = () => {
    const history = useHistory()
    const {
        shopName,
        shopType,
        scenarioIndex: scenarioIndexParam,
    } = useParams<{
        shopName: string
        shopType: string
        scenarioIndex: string
    }>()

    const { isLoading, isUpdatePending, scenarios, handleScenariosUpdate } =
        useReportOrderIssueFlow()

    const scenarioIndex = parseInt(scenarioIndexParam, 10)
    const scenario: SelfServiceReportIssueCase | null =
        scenarios[scenarioIndex] ?? null
    const isFallback =
        scenarios.length > 0 && scenarioIndex === scenarios.length - 1

    const handleScenarioUpdate = useCallback(
        async (updatedScenario: SelfServiceReportIssueCase) => {
            const updatedScenarios = [...scenarios]
            updatedScenarios[scenarioIndex] = updatedScenario
            await handleScenariosUpdate(updatedScenarios, {
                success: 'Scenario saved',
                error: 'Failed to save scenario',
            })
        },
        [handleScenariosUpdate, scenarios, scenarioIndex],
    )

    const handleScenarioDelete = useCallback(async () => {
        const updatedScenarios = scenarios.filter((_, i) => i !== scenarioIndex)
        await handleScenariosUpdate(updatedScenarios)
        history.push(
            `/app/settings/order-management/${shopType}/${shopName}/report-issue`,
        )
    }, [
        handleScenariosUpdate,
        scenarios,
        scenarioIndex,
        history,
        shopType,
        shopName,
    ])

    return {
        scenario,
        isFallback,
        isLoading,
        isUpdatePending,
        handleScenarioUpdate,
        handleScenarioDelete,
    }
}
