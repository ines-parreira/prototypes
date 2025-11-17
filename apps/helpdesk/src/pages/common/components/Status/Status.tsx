import type { ReactNode } from 'react'
import React from 'react'

import css from './Status.less'

type Props = {
    children: ReactNode
    type: StatusType
    id?: string
}

export enum StatusType {
    Error = 'error',
    Success = 'success',
    Warning = 'warning',
    Info = 'info',
}

export default function Status({ children, type, id }: Props) {
    return (
        <div className={css.status} id={id}>
            <div
                className={css.dot}
                style={{ backgroundColor: `var(--dot-${type})` }}
            />
            <div>{children}</div>
        </div>
    )
}
