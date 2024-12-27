import {Tooltip} from '@gorgias/merchant-ui-kit'
import React from 'react'

import KPI from 'assets/img/KPI.svg'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon.less'
import {ChartType} from 'pages/stats/custom-reports/types'

export const CHARTS_MODAL_ICONS: Record<
    ChartType,
    {name: string; tooltip: string}
> = {
    [ChartType.Card]: {
        name: 'KPI',
        tooltip: 'Key Performance Indicator',
    },
    [ChartType.Graph]: {
        name: 'bar_chart',
        tooltip: 'Graph',
    },
    [ChartType.Table]: {
        name: 'table_chart',
        tooltip: 'Table',
    },
}

type Props = {
    icon: {name: string; tooltip: string}
    id: string
}

export const ChartIcon = ({icon, id}: Props) => {
    return (
        <>
            <Tooltip target={id}>{icon.tooltip}</Tooltip>
            {icon.name === 'KPI' ? (
                <img id={id} src={KPI} alt="KPI" className={css.icon} />
            ) : (
                <IconInput id={id} icon={icon.name} className={css.icon} />
            )}
        </>
    )
}
