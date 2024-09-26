import React, {ReactNode} from 'react'

import Spinner from 'pages/common/components/Spinner'

import css from './MetaLabel.less'

export type Props = {
    label?: string
    isLoading?: boolean
    children?: ReactNode
}

export default function MetaLabel({label, isLoading, children}: Props) {
    return (
        <span className={css.from}>
            {isLoading ? (
                <Spinner className={css.spinner} width={18} color="dark" />
            ) : (
                <>
                    {label && <span className={css.label}>{label} </span>}
                    <span className={css.value}>{children}</span>
                </>
            )}
        </span>
    )
}
