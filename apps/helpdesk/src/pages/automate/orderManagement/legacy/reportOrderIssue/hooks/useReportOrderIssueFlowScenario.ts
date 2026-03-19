import { useCallback, useEffect, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { convertFromHTML, convertToHTML } from 'utils/editor'
import { trimHTML } from 'utils/html'

import { SCENARIO_REASON_DEFAULT_ACTION } from '../constants'
import useReportOrderIssueFlowScenarios from './useReportOrderIssueFlowScenarios'

const useReportOrderIssueFlowScenario = (
    shopName: string,
    scenarioIndex: number,
) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const {
        isFetchPending,
        isUpdatePending,
        scenarios,
        storeIntegration,
        selfServiceConfiguration,
        handleScenariosUpdate,
    } = useReportOrderIssueFlowScenarios(shopName)

    const isFallback = scenarioIndex === scenarios.length - 1
    const scenario = useMemo<SelfServiceReportIssueCase | undefined>(
        () =>
            scenarios[scenarioIndex] && {
                ...scenarios[scenarioIndex],
                newReasons: scenarios[scenarioIndex].newReasons.map(
                    (reason) => {
                        let action

                        if (reason.action) {
                            const html = convertToHTML(
                                convertFromHTML(
                                    reason.action.responseMessageContent.html,
                                ),
                            )

                            action = {
                                ...reason.action,
                                responseMessageContent: {
                                    ...reason.action.responseMessageContent,
                                    html: reason.action.responseMessageContent
                                        .text.length
                                        ? html
                                        : trimHTML(html),
                                },
                            }
                        } else {
                            action = SCENARIO_REASON_DEFAULT_ACTION
                        }

                        return { ...reason, action }
                    },
                ),
            },
        [scenarios, scenarioIndex],
    )

    useEffect(() => {
        if (selfServiceConfiguration && !scenario) {
            void dispatch(
                notify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                }),
            )

            history.push(
                `/app/automation/shopify/${shopName}/order-management/report-issue`,
            )
        }
    }, [selfServiceConfiguration, scenario, dispatch, history, shopName])

    const handleScenarioUpdate = useCallback(
        (nextScenario: SelfServiceReportIssueCase) => {
            const nextScenarios = [...scenarios]

            nextScenarios[scenarioIndex] = nextScenario

            void handleScenariosUpdate(nextScenarios)
        },
        [handleScenariosUpdate, scenarios, scenarioIndex],
    )
    const handleScenarioDelete = useCallback(async () => {
        const nextScenarios = [...scenarios]

        nextScenarios.splice(scenarioIndex, 1)

        await handleScenariosUpdate(nextScenarios, {
            success: 'Successfully deleted',
            error: 'Failed to delete',
        })

        history.push(
            `/app/automation/shopify/${shopName}/order-management/report-issue`,
        )
    }, [handleScenariosUpdate, scenarios, scenarioIndex, history, shopName])

    return {
        isFetchPending,
        isUpdatePending,
        isFallback,
        scenario,
        storeIntegration,
        selfServiceConfiguration,
        handleScenarioUpdate,
        handleScenarioDelete,
    }
}

export default useReportOrderIssueFlowScenario
