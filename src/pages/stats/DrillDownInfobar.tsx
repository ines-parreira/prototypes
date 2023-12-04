import React from 'react'
import {DrillDownDownloadButton} from 'pages/stats/DrillDownDownloadButton'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'

import css from './DrillDownInfobar.less'

export const DrillDownInfobar = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {data, perPage} = useDrillDownData(metricData)

    return (
        <div className={css.wrapper}>
            <div className={css.icon}>
                <i className="material-icons">info</i>
            </div>
            <div className={css.text}>
                <strong>{perPage}</strong> out of{' '}
                <strong>{data.length} tickets</strong> are shown.
            </div>
            <DrillDownDownloadButton />
        </div>
    )
}
