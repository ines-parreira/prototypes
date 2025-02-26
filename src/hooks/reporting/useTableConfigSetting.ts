import { useCallback, useMemo } from 'react'

import { CombinedState } from 'redux'
import { Selector } from 'reselect'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { AccountSettingTableConfig } from 'state/currentAccount/types'
import { RootState, StoreDispatch, StoreState } from 'state/types'
import { TableColumnSet, TableRowSet, TableView } from 'state/ui/stats/types'

const getActiveViewFromTableSetting = <
    T extends TableColumnSet,
    R extends TableRowSet,
>(
    setting: AccountSettingTableConfig<T, R> | undefined,
): TableView<T, R> | undefined => {
    if (setting !== undefined) {
        const currentSettings = setting.data
        return currentSettings.views.find(
            (view) => view.id === currentSettings.active_view,
        )
    }
    return setting
}

export const useTableConfigSetting = <
    T extends TableColumnSet,
    R extends TableRowSet,
>(
    tableSettingSelector: Selector<
        RootState,
        AccountSettingTableConfig<T, R> | undefined
    >,
    fallbackView: TableView<T, R>,
    columnsOrder: T[],
    rowsOrder: R[],
    submitActiveViewAction: (
        activeView: TableView<T, R>,
    ) => (
        dispatch: StoreDispatch,
        getState: () => CombinedState<StoreState>,
    ) => Promise<ReturnType<StoreDispatch>>,
) => {
    const dispatch = useAppDispatch()
    const tableConfig = useAppSelector(tableSettingSelector)

    const submitActiveView = useCallback(
        async (activeView: TableView<T, R>) => {
            await dispatch(submitActiveViewAction(activeView))
        },
        [dispatch, submitActiveViewAction],
    )

    return useMemo(() => {
        const currentView =
            getActiveViewFromTableSetting(tableConfig) || fallbackView
        const currentViewColumnsInOrder = currentView.metrics
            .map((metric) => metric.id)
            .filter((column) => columnsOrder.includes(column))
        const currentViewRowsInOrder = (currentView?.rows ?? [])
            .map((row) => row.id)
            .filter((rowId) => rowsOrder.includes(rowId))
        const columnsMissingInSettings = columnsOrder.filter(
            (column) => !currentViewColumnsInOrder.includes(column),
        )
        const rowsMissingInSettings = rowsOrder.filter(
            (row) => !currentViewRowsInOrder.includes(row),
        )

        const columnsInOrder = [
            ...currentViewColumnsInOrder,
            ...columnsMissingInSettings,
        ]

        const rowsInOrder = [
            ...currentViewRowsInOrder,
            ...rowsMissingInSettings,
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

        if (rowsOrder.length > 0) {
            currentView.rows = rowsInOrder.map((row) => {
                const savedSetting = (currentView?.rows ?? []).find(
                    (entry) => entry.id === row,
                )
                return {
                    id: row,
                    visibility:
                        savedSetting?.visibility !== undefined
                            ? savedSetting?.visibility
                            : null,
                }
            })
        }

        const filteredRowsOrder = (currentView?.rows ?? [])
            .filter((row) => row.visibility !== false)
            .map((row) => row.id)

        return {
            currentView,
            columnsOrder: filteredColumnsOrder,
            rowsOrder: filteredRowsOrder,
            submitActiveView,
        }
    }, [columnsOrder, fallbackView, rowsOrder, submitActiveView, tableConfig])
}
