import classnames from 'classnames'
import React, {useContext} from 'react'

import Spinner from 'pages/common/components/Spinner'

import {BaseButtonContext} from './BaseButton'
import css from './ButtonSpinner.less'

type Props = {
    className?: string
}

export default function ButtonSpinner({className}: Props) {
    const contextValue = useContext(BaseButtonContext)

    return (
        <Spinner
            className={classnames(
                css.spinner,
                className,
                css[contextValue.size]
            )}
            color="gloom"
        />
    )
}
