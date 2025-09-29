import { memo, ReactNode } from 'react'

import { Card } from '@gorgias/analytics-ui-kit'
import { Skeleton } from '@gorgias/axiom'

import css from './MetricCard.less'

export type MetricCardProps = {
    children: ReactNode
    tip?: ReactNode
    isLoading: boolean
    'data-candu-id'?: string
}

export const MetricCard = memo<MetricCardProps>(
    ({ children, tip, isLoading = false, 'data-candu-id': dataCanduId }) => {
        return (
            <Card className={css.card}>
                <div data-candu-id={dataCanduId}>
                    {isLoading ? (
                        <Skeleton height={32} width={100} />
                    ) : (
                        children
                    )}

                    {tip &&
                        (isLoading ? (
                            <Skeleton height={132} className={css.tip} inline />
                        ) : (
                            <div className={css.tip}>{tip}</div>
                        ))}
                </div>
            </Card>
        )
    },
)
