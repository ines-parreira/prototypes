import {useEffect, useMemo, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'

import {StatsFilters} from 'models/stat/types'
import {ReportFetch} from 'pages/stats/custom-reports/types'
import {getSelectedMetric} from 'state/ui/stats/busiestTimesSlice'
import {
    getCustomFieldsOrder,
    getSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'

export const useTables = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    fetchTables: {title: string; fetchTable: ReportFetch}[]
) => {
    const [tableData, setTableData] = useState<{
        isFetching: boolean
        files: Record<string, string>
    }>({
        isFetching: true,
        files: {},
    })
    const customFieldsOrder = useAppSelector(getCustomFieldsOrder)
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const selectedBTODMetric = useAppSelector(getSelectedMetric)
    const context = useMemo(
        () => ({
            customFieldsOrder,
            selectedCustomFieldId:
                selectedCustomField.id !== null
                    ? String(selectedCustomField.id)
                    : null,
            selectedBTODMetric,
        }),
        [customFieldsOrder, selectedCustomField, selectedBTODMetric]
    )

    useEffect(() => {
        const promises = fetchTables.map((fetchTable) =>
            fetchTable.fetchTable(
                cleanStatsFilters,
                userTimezone,
                granularity,
                context
            )
        )
        void Promise.all(promises)
            .then((results) => {
                setTableData({
                    isFetching: false,
                    files: Object.assign({}, ...results.map((r) => r.files)),
                })
            })
            .catch(() => setTableData({isFetching: false, files: {}}))
    }, [cleanStatsFilters, context, fetchTables, granularity, userTimezone])

    return tableData
}
