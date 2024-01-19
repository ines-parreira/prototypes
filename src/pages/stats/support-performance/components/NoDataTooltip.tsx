import React from 'react'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import css from 'pages/stats/SupportPerformanceOverview.less'

export const NO_DATA_TOOLTIP_ICON = 'help_outline'
const NO_DATA_TOOLTIP_TEXT = 'No data available for the selected period.'

export const NoDataTooltip = () => (
    <IconTooltip icon={NO_DATA_TOOLTIP_ICON} className={css.tooltipIcon}>
        {NO_DATA_TOOLTIP_TEXT}
    </IconTooltip>
)
