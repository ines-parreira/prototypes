import React, { ReactNode } from 'react'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import css from './MetaLabel.less'

export type Props = {
    label?: string
    isLoading?: boolean
    children?: ReactNode
}

export default function MetaLabel({ label, isLoading, children }: Props) {
    return (
        <span className={css.from}>
            {isLoading ? (
                <LoadingSpinner
                    className={css.spinner}
                    size={18}
                    color="dark"
                />
            ) : (
                <>
                    {label && <span className={css.label}>{label} </span>}
                    <span className={css.value}>{children}</span>
                </>
            )}
        </span>
    )
}
