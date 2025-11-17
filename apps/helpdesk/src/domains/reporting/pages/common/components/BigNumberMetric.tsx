import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/BigNumberMetric.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
    trendBadge?: ReactNode
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * If you need to add a loading state, use Skeleton from '@gorgias/axiom' instead
 * @date 2025-09-15
 * @type reporting-ui-kit
 */
export default function BigNumberMetric({
    children,
    className,
    isLoading = false,
    trendBadge,
}: Props) {
    if (isLoading) {
        return <Skeleton height={32} width={100} />
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
