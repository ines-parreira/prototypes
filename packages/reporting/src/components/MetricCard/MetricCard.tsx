import type { ReactNode } from 'react'
import { memo } from 'react'

import classNames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'

import css from './MetricCard.less'

export type MetricCardProps = {
    children: ReactNode
    tip?: ReactNode
    'data-candu-id'?: string
    withBorder?: boolean
    withFixedWidth?: boolean
}

export const MetricCard = memo<MetricCardProps>(
    ({
        children,
        tip,
        'data-candu-id': dataCanduId,
        withBorder = true,
        withFixedWidth = true,
    }) => {
        return (
            <Card
                className={classNames(css.card, {
                    [css.cardNoBorder]: !withBorder,
                    [css.cardFixedWidth]: withFixedWidth,
                })}
            >
                <div className={css.content} data-candu-id={dataCanduId}>
                    {children}
                    {tip && <div className={css.tip}>{tip}</div>}
                </div>
            </Card>
        )
    },
)
