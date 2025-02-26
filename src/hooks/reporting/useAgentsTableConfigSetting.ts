import { useMemo } from 'react'

import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    agentPerformanceTableActiveView,
    AgentsTableViews,
    TableColumnsOrderWithOnlineTime,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    submitAgentTableConfigView,
    submitSetting,
} from 'state/currentAccount/actions'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'
import { AgentsTableColumn, TableView } from 'state/ui/stats/types'

export const useAgentTableSetting = () =>
    useTableConfigSetting(
        getAgentsTableConfigSettingsJS,
        agentPerformanceTableActiveView,
        TableColumnsOrderWithOnlineTime,
        submitAgentTableConfigView,
    )

export const useAgentsTableConfigSetting = () => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(getAgentsTableConfigSettingsJS)
    const currentSettings = settings ? settings.data : AgentsTableViews
    const currentView =
        currentSettings.views.find(
            (view) => view.id === currentSettings.active_view,
        ) || agentPerformanceTableActiveView

    const currentViewColumnsInOrder = currentView.metrics
        .map((metric) => metric.id)
        .filter((column) => TableColumnsOrderWithOnlineTime.includes(column))
    const columnsMissingInSettings = TableColumnsOrderWithOnlineTime.filter(
        (column) => !currentViewColumnsInOrder.includes(column),
    )
    const columnsInOrder = [
        ...currentViewColumnsInOrder,
        ...columnsMissingInSettings,
    ]

    currentView.metrics = columnsInOrder.map((metric) => {
        const savedSetting = currentView.metrics.find(
            (entry) => entry.id === metric,
        )
        return {
            id: metric,
            visibility:
                savedSetting?.visibility !== undefined
                    ? savedSetting?.visibility
                    : null,
        }
    })

    const submitActiveView = async (
        activeView: TableView<AgentsTableColumn>,
    ) => {
        await dispatch(
            submitSetting({
                id: settings?.id,
                type: AccountSettingType.AgentsTableConfig,
                data: {
                    active_view: activeView.id,
                    views: currentSettings.views.find(
                        (view) => view.id === activeView.id,
                    )
                        ? currentSettings.views.map((view) =>
                              view.id === activeView.id ? activeView : view,
                          )
                        : [...currentSettings.views, activeView],
                },
            }),
        )
    }

    const columnsOrder = useMemo(() => {
        return currentView.metrics
            .filter((metric) => metric.visibility !== false)
            .map((metric) => metric.id)
    }, [currentView])

    return {
        settings: currentSettings,
        currentView,
        columnsOrder,
        submitActiveView,
    }
}
