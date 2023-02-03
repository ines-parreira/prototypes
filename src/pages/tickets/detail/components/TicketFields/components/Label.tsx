import React, {ReactNode} from 'react'

import css from './Label.less'

type Props = {
    label: string
    children: ReactNode
    isRequired?: boolean
}

export default function Label({label, children, isRequired = false}: Props) {
    return (
        <label className={css.labelWrapper}>
            <span className={css.label}>{label}:</span>
            {isRequired && <sup className={css.asterisk}>*</sup>}
            {children}
        </label>
    )
}
