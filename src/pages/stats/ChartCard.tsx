import classnames from 'classnames'
import React, {ComponentProps, ReactNode} from 'react'

import {Card} from '@gorgias/analytics-ui-kit'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import Tooltip from 'pages/common/components/Tooltip'
import css from './ChartCard.less'

type Props = {
    children?: ReactNode
    className?: string
    hint?: ReactNode
    title: ReactNode
    titleExtra?: ReactNode
    noPadding?: boolean
    tooltipProps?: Partial<ComponentProps<typeof Tooltip>>
}

export default function ChartCard({
    children,
    className,
    hint,
    title,
    titleExtra,
    noPadding = false,
    tooltipProps,
}: Props) {
    return (
        <Card
            className={classnames(className, css.card, {
                [css.noPadding]: noPadding,
            })}
        >
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <span>{title}</span>
                    {hint && (
                        <IconTooltip
                            tooltipProps={tooltipProps}
                            className={css.tooltip}
                        >
                            {hint}
                        </IconTooltip>
                    )}
                </div>

                {titleExtra}
            </div>

            {children}
        </Card>
    )
}
