import classnames from 'classnames'
import React, {ReactNode} from 'react'

import {Card} from '@gorgias/analytics-ui-kit'
import css from './ChartCard.less'
import {TooltipData} from './types'
import {HintTooltip} from './common/HintTooltip'

type Props = {
    children?: ReactNode
    className?: string
    hint?: TooltipData
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
                        <HintTooltip
                            className={`${css.tooltipIcon}`}
                            {...hint}
                        />
                    )}
                </div>

                {titleExtra}
            </div>

            {children}
        </Card>
    )
}
