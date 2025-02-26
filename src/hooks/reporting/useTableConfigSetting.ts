import { useCallback, useMemo } from 'react'

import { CombinedState } from 'redux'
import { Selector } from 'reselect'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { AccountSettingTableConfig } from 'state/currentAccount/types'
import { RootState, StoreDispatch, StoreState } from 'state/types'
import { TableColumnSet, TableView } from 'state/ui/stats/types'

const getActiveViewFromTableSetting = <T extends TableColumnSet>(
    setting: AccountSettingTableConfig<T> | undefined,
): TableView<T> | undefined => {
    if (setting !== undefined) {
        const currentSettings = setting.data
        return currentSettings.views.find(
            (view) => view.id === currentSettings.active_view,
        )
    }
    return setting
}

export const useTableConfigSetting = <T extends TableColumnSet>(
    tableSettingSelector: Selector<
        RootState,
        AccountSettingTableConfig<T> | undefined
    >,
    fallbackView: TableView<T>,
    columnsOrder: T[],
    submitActiveViewAction: (
        activeView: TableView<T>,
    ) => (
        dispatch: StoreDispatch,
        getState: () => CombinedState<StoreState>,
    ) => Promise<ReturnType<StoreDispatch>>,
) => {
    const dispatch = useAppDispatch()
    const tableConfig = useAppSelector(tableSettingSelector)

    const submitActiveView = useCallback(
        async (activeView: TableView<T>) => {
            await dispatch(submitActiveViewAction(activeView))
        },
        [dispatch, submitActiveViewAction],
    )

    const response = useMemo(() => {
        const currentView =
            getActiveViewFromTableSetting(tableConfig) || fallbackView
        const currentViewColumnsInOrder = currentView.metrics
            .map((metric) => metric.id)
            .filter((column) => columnsOrder.includes(column))
        const columnsMissingInSettings = columnsOrder.filter(
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

        const filteredColumnsOrder = currentView?.metrics
            .filter((metric) => metric.visibility !== false)
            .map((metric) => metric.id)

        return {
            currentView,
            columnsOrder: filteredColumnsOrder,
            submitActiveView,
        }
    }, [columnsOrder, fallbackView, submitActiveView, tableConfig])

    return response
}
