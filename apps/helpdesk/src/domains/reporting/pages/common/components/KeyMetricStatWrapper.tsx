import type { HTMLAttributes } from 'react'
import React from 'react'

import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/KeyMetricStatWrapper.less'

export default function KeyMetricStatWrapper({
    className,
    ...divProps
}: HTMLAttributes<HTMLDivElement>) {
    return <div className={classNames(css.wrapper, className)} {...divProps} />
}
