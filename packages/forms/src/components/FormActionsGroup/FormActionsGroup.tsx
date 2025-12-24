import React, { type PropsWithChildren } from 'react'

import cn from 'classnames'

import css from './FormActionsGroup.less'

export default function FormActionsGroup({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return <div className={cn(css.actionsGroup, className)}>{children}</div>
}
