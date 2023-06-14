import classnames from 'classnames'
import React, {ReactNode} from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './BigNumberMetric.less'

type Props = {
    children: ReactNode
    className?: string
    from?: ReactNode
    isLoading?: boolean
}

export default function BigNumberMetric({
    children,
    className,
    from,
    isLoading = false,
}: Props) {
    if (isLoading) {
        return <Skeleton height={32} />
    }

    return (
        <div
            className={classnames(
                className,
                css.wrapper,
                'heading-page-semibold'
            )}
        >
            {children}

            {from && (
                <span className={classnames(css.from, 'caption-regular')}>
                    from {from}
                </span>
            )}
        </div>
    )
}
