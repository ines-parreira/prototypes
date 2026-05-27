import type { ReactNode } from 'react'
import { memo } from 'react'

import classNames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'

import css from './MetricCard.less'

export type MetricCardCompactVariant = 'plain' | 'with-sparkline'

export type MetricCardProps = {
    children: ReactNode
    tip?: ReactNode
    'data-candu-id'?: string
    withBorder?: boolean
    withFixedWidth?: boolean
    compactVariant?: MetricCardCompactVariant
}

export const MetricCard = memo<MetricCardProps>(
    ({
        children,
        tip,
        'data-candu-id': dataCanduId,
        withBorder = true,
        withFixedWidth = true,
        compactVariant,
    }) => {
        const isCompactPlain = compactVariant === 'plain'
        const isCompactWithSparkline = compactVariant === 'with-sparkline'

        return (
            <Card
                className={classNames(css.card, {
                    [css.cardNoBorder]: !withBorder,
                    [css.cardFixedWidth]: withFixedWidth,
                    [css.cardCompact]: isCompactPlain,
                    [css.cardCompactWithSparkline]: isCompactWithSparkline,
                })}
            >
                <div
                    className={classNames(css.content, {
                        [css.contentCompact]: isCompactPlain,
                        [css.contentCompactWithSparkline]:
                            isCompactWithSparkline,
                    })}
                    data-candu-id={dataCanduId}
                >
                    {children}
                    {tip && <div className={css.tip}>{tip}</div>}
                </div>
            </Card>
        )
    },
)
