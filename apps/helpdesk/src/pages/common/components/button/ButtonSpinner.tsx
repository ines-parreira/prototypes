import React, { useContext } from 'react'

import classnames from 'classnames'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { BaseButtonContext } from './BaseButton'

import css from './ButtonSpinner.less'

const spinnerSize = {
    medium: 22,
    small: 15,
}

type Props = {
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` from @gorgias/axiom instead, which has built-in loading state.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export default function ButtonSpinner({ className }: Props) {
    const contextValue = useContext(BaseButtonContext)

    return (
        <LoadingSpinner
            size={spinnerSize[contextValue.size]}
            className={classnames(css.spinner, className)}
        />
    )
}
