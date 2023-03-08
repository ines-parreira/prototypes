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
}

export default function ChartCard({children, className, hint, title}: Props) {
    return (
        <Card className={classnames(className, css.card)}>
            <div className={css.title}>
                <span className="heading-section-semibold">{title}</span>

                {hint && (
                    <IconTooltip className={css.tooltip}>{hint}</IconTooltip>
                )}
            </div>

            {children}
        </Card>
    )
}
