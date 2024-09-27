import React from 'react'
import classnames from 'classnames'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {TooltipData} from 'pages/stats/types'
import {DOCUMENTATION_LINK_TEXT} from 'services/reporting/constants'
import {hintTooltipDelay} from 'pages/stats/common/constants'
import css from 'pages/stats/common/HintTooltip.less'

export const HintTooltipContent = ({title, link}: TooltipData) => {
    return (
        <>
            {title}
            {typeof title !== 'boolean' && title !== '' && <br />}
            {link && (
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {DOCUMENTATION_LINK_TEXT}
                </a>
            )}
        </>
    )
}

export const HintTooltip = ({title, link, className}: TooltipData) => {
    return (
        <IconTooltip
            tooltipProps={{
                innerProps: {
                    innerClassName: classnames(css.innerTooltip),
                    boundariesElement: 'window',
                },
                delay: hintTooltipDelay,
                autohide: false,
                placement: 'top-start',
            }}
            className={classnames(css.tooltip, className)}
        >
            <HintTooltipContent title={title} link={link} />
        </IconTooltip>
    )
}
