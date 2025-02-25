import React, { ReactNode } from 'react'

import classnames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from './BigNumberMetric.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
    trendBadge?: ReactNode
}

export default function BigNumberMetric({
    children,
    className,
    isLoading = false,
    trendBadge,
}: Props) {
    if (isLoading) {
        return <Skeleton height={32} />
    }

    return (
        <div
            className={classnames(
                className,
                css.wrapper,
                'heading-page-semibold',
            )}
        >
            {children}

            {trendBadge ? trendBadge : null}
        </div>
    )
}
