import React from 'react'
import {DrillDownDownloadButton} from './DrillDownDownloadButton'
import {useDrillDownData} from './useDrillDownData'

import css from './DrillDownInfobar.less'

export const DrillDownInfobar = () => {
    const {data, perPage} = useDrillDownData()

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
