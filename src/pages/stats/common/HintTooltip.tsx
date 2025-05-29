import { ReactNode } from 'react'

import classnames from 'classnames'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { hintTooltipDelay } from 'pages/stats/common/constants'
import css from 'pages/stats/common/HintTooltip.less'
import { TooltipData } from 'pages/stats/types'
import { DOCUMENTATION_LINK_TEXT } from 'services/reporting/constants'

type Props = Omit<TooltipData, 'title'> & {
    title: string | ReactNode
}

export const HintTooltipContent = ({
    title,
    link,
    linkText = DOCUMENTATION_LINK_TEXT,
}: Props) => {
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

export const HintTooltip = ({ title, link, linkText, className }: Props) => {
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
