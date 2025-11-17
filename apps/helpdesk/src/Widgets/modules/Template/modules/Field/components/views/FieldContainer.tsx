import type { ComponentProps } from 'react'
import React from 'react'

import cs from 'classnames'

import css from './FieldContainer.less'

export default function FieldContainer({
    className,
    ...props
}: ComponentProps<'div'>) {
    return <div className={cs(css.fieldContainer, className)} {...props} />
}
