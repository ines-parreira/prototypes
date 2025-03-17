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

    const defaultCurrentView = useMemo(
        () => getActiveViewFromTableSetting(tableConfig) || fallbackView,
        [fallbackView, tableConfig],
    )

    const currentViewColumnsInOrder = useMemo(
        () =>
            defaultCurrentView.metrics
                .map((metric) => metric.id)
                .filter((column) => columnsOrder.includes(column)),
        [defaultCurrentView, columnsOrder],
    )

    const currentViewRowsInOrder = useMemo(
        () =>
            (defaultCurrentView?.rows ?? fallbackView.rows ?? [])
                .map((row) => row.id)
                .filter((rowId) => rowsOrder.includes(rowId)),
        [defaultCurrentView, fallbackView, rowsOrder],
    )

    const columnsMissingInSettings = useMemo(
        () =>
            columnsOrder.filter(
                (column) => !currentViewColumnsInOrder.includes(column),
            ),
        [columnsOrder, currentViewColumnsInOrder],
    )

    const rowsMissingInSettings = useMemo(
        () => rowsOrder.filter((row) => !currentViewRowsInOrder.includes(row)),
        [rowsOrder, currentViewRowsInOrder],
    )

    const columnsInOrder = useMemo(
        () => [...currentViewColumnsInOrder, ...columnsMissingInSettings],
        [currentViewColumnsInOrder, columnsMissingInSettings],
    )

    const rowsInOrder = useMemo(
        () => [...currentViewRowsInOrder, ...rowsMissingInSettings],
        [currentViewRowsInOrder, rowsMissingInSettings],
    )
    const currentViewMetrics = useMemo(
        () =>
            columnsInOrder.map((metric) => {
                const savedSetting = defaultCurrentView.metrics.find(
                    (entry) => entry.id === metric,
                )
                return {
                    id: metric,
                    visibility:
                        savedSetting?.visibility !== undefined
                            ? savedSetting?.visibility
                            : null,
                }
            }),
        [columnsInOrder, defaultCurrentView],
    )

    const filteredColumnsOrder = useMemo(
        () =>
            currentViewMetrics
                .filter((metric) => metric.visibility !== false)
                .map((metric) => metric.id),
        [currentViewMetrics],
    )

    const currentViewRows = useMemo(() => {
        if (rowsOrder.length === 0) {
            return []
        }

        return rowsInOrder?.map((row) => {
            const savedSetting = (
                defaultCurrentView?.rows ??
                fallbackView.rows ??
                []
            ).find((entry) => entry.id === row)

            return {
                id: row,
                visibility: savedSetting?.visibility || false,
            }
        })
    }, [rowsInOrder, defaultCurrentView, rowsOrder, fallbackView])

    const filteredRowsOrder = useMemo(
        () =>
            currentViewRows
                .filter((row) => row.visibility !== false)
                .map((row) => row.id),
        [currentViewRows],
    )

    const currentView = useMemo(
        () => ({
            ...defaultCurrentView,
            metrics: currentViewMetrics,
            rows: currentViewRows,
        }),
        [currentViewRows, currentViewMetrics, defaultCurrentView],
    )

    return {
        currentView,
        columnsOrder: filteredColumnsOrder,
        rowsOrder: filteredRowsOrder,
        submitActiveView,
    }
}
