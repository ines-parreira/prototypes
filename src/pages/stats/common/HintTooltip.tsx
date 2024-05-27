import React from 'react'
import classnames from 'classnames'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {TooltipData} from 'pages/stats/types'
import {DOCUMENTATION_LINK_TEXT} from 'services/reporting/constants'
import css from './HintTooltip.less'

export const HintTooltip = ({title, link, className}: TooltipData) => {
    return (
        <IconTooltip
            tooltipProps={{
                innerProps: {
                    innerClassName: css.innerTooltip,
                    boundariesElement: 'window',
                },
                delay: {show: 0, hide: 500},
                autohide: false,
                placement: 'top-start',
            }}
            className={classnames(css.tooltip, className)}
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
