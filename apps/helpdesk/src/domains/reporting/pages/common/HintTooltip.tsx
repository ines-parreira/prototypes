import { ReactElement, ReactNode } from 'react'

import classnames from 'classnames'

import { hintTooltipDelay } from 'domains/reporting/pages/common/constants'
import css from 'domains/reporting/pages/common/HintTooltip.less'
import { TooltipData } from 'domains/reporting/pages/types'
import { DOCUMENTATION_LINK_TEXT } from 'domains/reporting/services/constants'
import IconTooltip, {
    IconTooltipProps,
} from 'pages/common/forms/IconTooltip/IconTooltip'

type Props = Omit<TooltipData, 'title'> & {
    title: string | ReactNode | ReactElement
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

const tooltipProps: IconTooltipProps['tooltipProps'] = {
    innerProps: {
        innerClassName: css.innerTooltip,
        boundariesElement: 'window',
    },
    delay: hintTooltipDelay,
    autohide: false,
    placement: 'top-start',
}

export const HintTooltip = ({ title, link, linkText, className }: Props) => {
    return (
        <IconTooltip
            tooltipProps={tooltipProps}
            className={classnames(css.tooltip, className)}
        >
            <HintTooltipContent title={title} link={link} linkText={linkText} />
        </IconTooltip>
    )
}
