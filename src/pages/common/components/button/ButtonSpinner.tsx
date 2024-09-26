import classnames from 'classnames'
import React, {useContext} from 'react'

import Spinner from 'pages/common/components/Spinner'

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
        <Spinner
            width={spinnerSize[contextValue.size]}
            className={classnames(css.spinner, className)}
        />
    )
}
