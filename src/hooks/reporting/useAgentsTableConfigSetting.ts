import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    agentPerformanceTableActiveView,
    SystemTableViews,
    TableColumnsOrderWithOnlineTime,
} from 'pages/stats/AgentsTableConfig'
import {submitSetting} from 'state/currentAccount/actions'
import {getAgentsTableConfigSettingsJS} from 'state/currentAccount/selectors'
import {AccountSettingType} from 'state/currentAccount/types'
import {TableView} from 'state/ui/stats/types'

export const useAgentsTableConfigSetting = () => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(getAgentsTableConfigSettingsJS)
    const currentSettings = settings ? settings.data : SystemTableViews
    const currentView =
        currentSettings.views.find(
            (view) => view.id === currentSettings.active_view
        ) || agentPerformanceTableActiveView

    const currentViewColumnsInOrder = currentView.metrics
        .map((metric) => metric.id)
        .filter((column) => TableColumnsOrderWithOnlineTime.includes(column))
    const columnsMissingInSettings = TableColumnsOrderWithOnlineTime.filter(
        (column) => !currentViewColumnsInOrder.includes(column)
    )
    const columnsInOrder = [
        ...currentViewColumnsInOrder,
        ...columnsMissingInSettings,
    ]

    currentView.metrics = columnsInOrder.map((metric) => {
        const savedSetting = currentView.metrics.find(
            (entry) => entry.id === metric
        )
        return {
            id: metric,
            visibility:
                savedSetting?.visibility !== undefined
                    ? savedSetting?.visibility
                    : null,
        }
    })

    const submitActiveView = async (activeView: TableView) => {
        await dispatch(
            submitSetting({
                id: settings?.id,
                type: AccountSettingType.AgentsTableConfig,
                data: {
                    active_view: activeView.id,
                    views: currentSettings.views.find(
                        (view) => view.id === activeView.id
                    )
                        ? currentSettings.views.map((view) =>
                              view.id === activeView.id ? activeView : view
                          )
                        : [...currentSettings.views, activeView],
                },
            })
        )
    }

    return {
        settings: currentSettings,
        currentView,
        columnsOrder:
            currentView?.metrics
                .filter((metric) => metric.visibility !== false)
                .map((metric) => metric.id) || [],
        submitActiveView,
    }
}
