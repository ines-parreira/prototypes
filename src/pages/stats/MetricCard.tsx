import classnames from 'classnames'
import React, {ReactNode} from 'react'

import Card from './Card'
import css from './MetricCard.less'

type Props = {
    className?: string
    children: ReactNode
}

export default function MetricCard({className, children}: Props) {
    return <Card className={classnames(css.card, className)}>{children}</Card>
}
