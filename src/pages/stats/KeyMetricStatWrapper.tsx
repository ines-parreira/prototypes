import React, {HTMLAttributes} from 'react'
import classNames from 'classnames'

import css from './KeyMetricStatWrapper.less'

export default function KeyMetricStatWrapper({
    className,
    ...divProps
}: HTMLAttributes<HTMLDivElement>) {
    return <div className={classNames(css.wrapper, className)} {...divProps} />
}
