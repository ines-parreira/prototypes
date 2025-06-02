import { useMemo } from 'react'

import _groupBy from 'lodash/groupBy'
import _keyBy from 'lodash/keyBy'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { useStoreAppsContext } from 'pages/aiAgent/actions/providers/StoreAppsContext'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import useGetIsActionStepEnabled from './useGetIsActionStepEnabled'

const useEnabledActionStepsByApp = (internalPlatformGrouping = false) => {
    const { apps } = useApps()
    const appsById = useMemo(() => _keyBy(apps, 'id'), [apps])

    const { recharge: rechargeIntegration } = useStoreAppsContext()

    const { data: steps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const getIsActionStepEnabled = useGetIsActionStepEnabled()

    return useMemo(() => {
        const enabledSteps = steps.filter((step) => {
            if (!getIsActionStepEnabled(step.internal_id)) return false
            // don't show recharge steps if the merchant doesn't have a recharge integration
            if (
                step.apps[0].type === 'recharge' &&
                !rechargeIntegration &&
                !internalPlatformGrouping
            ) {
                return false
            }
            return true
        })
        const stepsByApp = _groupBy(enabledSteps, (step) =>
            step.apps[0].type === 'app'
                ? step.apps[0].app_id
                : step.apps[0].type,
        )

        const sortedStepsByApp = Object.entries(stepsByApp).sort(
            ([id1], [id2]) =>
                appsById[id1].name.localeCompare(appsById[id2].name),
        )
        const stepsByUsefulness = sortedStepsByApp.reduce<{
            used: (typeof sortedStepsByApp)[number][]
            unused: (typeof sortedStepsByApp)[number][]
        }>(
            (acc, [appId, steps]) => {
                if (internalPlatformGrouping) {
                    acc.unused.push([appId, steps])
                } else if (
                    appId === 'shopify' ||
                    appId === 'recharge' ||
                    appsById[appId].installed
                ) {
                    acc.used.push([appId, steps])
                } else {
                    acc.unused.push([appId, steps])
                }
                return acc
            },
            { used: [], unused: [] },
        )

        return { stepsByUsefulness, appsById }
    }, [
        steps,
        getIsActionStepEnabled,
        appsById,
        internalPlatformGrouping,
        rechargeIntegration,
    ])
}

export default useEnabledActionStepsByApp
