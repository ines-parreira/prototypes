import React, {ReactNode} from 'react'

import css from './CardHeaderValue.less'

type Props = {
    children: ReactNode
    label?: string
}

export function CardHeaderValue({children, label}: Props) {
    return (
        <span className={css.container}>
            {label ? <span className={css.label}>{label}: </span> : null}
            <strong>{children}</strong>
        </span>
    )
}
