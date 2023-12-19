import useAppSelector from 'hooks/useAppSelector'
import {
    SystemTableViews,
    agentPerformanceTableActiveView,
} from 'pages/stats/AgentsTableConfig'
import {AccountSettingType} from 'state/currentAccount/types'
import {getAgentsTableConfigSettingsJS} from 'state/currentAccount/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {submitSetting} from 'state/currentAccount/actions'
import {TableView} from 'state/ui/stats/types'

export const useAgentsTableConfigSetting = () => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(getAgentsTableConfigSettingsJS)
    const currentSettings = settings ? settings.data : SystemTableViews
    const currentView =
        currentSettings.views.find(
            (view) => view.id === currentSettings.active_view
        ) || agentPerformanceTableActiveView

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
