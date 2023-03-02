import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './BigNumberMetric.less'

type Props = {
    children: ReactNode
    className?: string
    from?: ReactNode
}

export default function BigNumberMetric({children, className, from}: Props) {
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
