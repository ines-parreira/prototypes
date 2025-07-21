import { Tooltip } from '@gorgias/merchant-ui-kit'

import { KpiIcon } from 'domains/reporting/pages/common/icons/KpiIcon'
import css from 'domains/reporting/pages/dashboards/DashboardsModal/ChartIcon.less'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import IconInput from 'pages/common/forms/input/IconInput'

export const CHARTS_MODAL_ICONS: Record<
    ChartType,
    { name: string; tooltip: string }
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
    icon: { name: string; tooltip: string }
    id: string
}

export const ChartIcon = ({ icon, id }: Props) => {
    return (
        <>
            <Tooltip target={id}>{icon.tooltip}</Tooltip>
            {icon.name === 'KPI' ? (
                <span id={id} className={css.icon}>
                    <KpiIcon />
                </span>
            ) : (
                <IconInput id={id} icon={icon.name} className={css.icon} />
            )}
        </>
    )
}
