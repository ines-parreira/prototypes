import classnames from 'classnames'
import React, {ReactNode} from 'react'

import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import Card from './Card'
import css from './ChartCard.less'

type Props = {
    children?: ReactNode
    className?: string
    hint?: ReactNode
    title: ReactNode
    titleExtra?: ReactNode
    noPadding?: boolean
}

export default function ChartCard({
    children,
    className,
    hint,
    title,
    titleExtra,
    noPadding = false,
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
                        <IconTooltip className={css.tooltip}>
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
