import classnames from 'classnames'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { hintTooltipDelay } from 'pages/stats/common/constants'
import css from 'pages/stats/common/HintTooltip.less'
import { TooltipData } from 'pages/stats/types'
import { DOCUMENTATION_LINK_TEXT } from 'services/reporting/constants'

export const HintTooltipContent = ({
    title,
    link,
    linkText = DOCUMENTATION_LINK_TEXT,
}: TooltipData) => {
    return (
        <>
            {title}
            {typeof title !== 'boolean' && title !== '' && <br />}
            {link && (
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {linkText}
                </a>
            )}
        </>
    )
}

export const HintTooltip = ({
    title,
    link,
    linkText,
    className,
}: TooltipData) => {
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
            <HintTooltipContent title={title} link={link} linkText={linkText} />
        </IconTooltip>
    )
}
