import {useCallback, useEffect} from 'react'
import {useHistory} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {SelfServiceReportIssueCase} from 'models/selfServiceConfiguration/types'

import useReportOrderIssueFlowScenarios from './useReportOrderIssueFlowScenarios'

const useReportOrderIssueFlowScenario = (
    shopName: string,
    scenarioIndex: number
) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const {
        isFetchPending,
        isUpdatePending,
        scenarios,
        selfServiceConfiguration,
        handleScenariosUpdate,
    } = useReportOrderIssueFlowScenarios(shopName)

    const isFallback = scenarioIndex === scenarios.length - 1
    const scenario = scenarios[scenarioIndex] as
        | SelfServiceReportIssueCase
        | undefined

    useEffect(() => {
        if (selfServiceConfiguration && !scenario) {
            void dispatch(
                notify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                })
            )

            history.push(
                `/app/automation/shopify/${shopName}/order-management/report-issue`
            )
        }
    }, [selfServiceConfiguration, scenario, dispatch, history, shopName])

    const handleScenarioUpdate = useCallback(
        (nextScenario: SelfServiceReportIssueCase) => {
            const nextScenarios = [...scenarios]

            nextScenarios[scenarioIndex] = nextScenario

            void handleScenariosUpdate(nextScenarios)
        },
        [handleScenariosUpdate, scenarios, scenarioIndex]
    )
    const handleScenarioDelete = useCallback(async () => {
        const nextScenarios = [...scenarios]

        nextScenarios.splice(scenarioIndex, 1)

        await handleScenariosUpdate(nextScenarios, {
            success: 'Successfully deleted',
            error: 'Failed to delete',
        })

        history.push(
            `/app/automation/shopify/${shopName}/order-management/report-issue`
        )
    }, [handleScenariosUpdate, scenarios, scenarioIndex, history, shopName])

    return {
        isFetchPending,
        isUpdatePending,
        isFallback,
        scenario,
        selfServiceConfiguration,
        handleScenarioUpdate,
        handleScenarioDelete,
    }
}

export default useReportOrderIssueFlowScenario
