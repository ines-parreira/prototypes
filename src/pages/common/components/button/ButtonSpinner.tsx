import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useContext} from 'react'

import {BaseButtonContext} from './BaseButton'
import css from './ButtonSpinner.less'

const spinnerSize = {
    medium: 22,
    small: 15,
}

type Props = {
    className?: string
}

export default function ButtonSpinner({className}: Props) {
    const contextValue = useContext(BaseButtonContext)

    return (
        <LoadingSpinner
            size={spinnerSize[contextValue.size]}
            className={classnames(css.spinner, className)}
        />
    )
}
