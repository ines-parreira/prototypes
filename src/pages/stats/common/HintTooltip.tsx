import React from 'react'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {TooltipData} from 'pages/stats/types'
import {DOCUMENTATION_LINK_TEXT} from 'services/reporting/constants'
import css from './HintTooltip.less'

export const HintTooltip = ({title, link}: TooltipData) => {
    return (
        <IconTooltip
            tooltipProps={{
                innerClassName: css.innerTooltip,
                boundariesElement: 'window',
                delay: {show: 0, hide: 500},
                autohide: false,
                placement: 'top-start',
            }}
            className={css.tooltip}
        >
            {title}
            <br />
            {link && (
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {DOCUMENTATION_LINK_TEXT}
                </a>
            )}
        </IconTooltip>
    )
}
