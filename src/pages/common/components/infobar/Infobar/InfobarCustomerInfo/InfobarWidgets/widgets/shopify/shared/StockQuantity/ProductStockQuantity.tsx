import React from 'react'

import css from './ProductStockQuantity.less'

type Props = {
    value: number
    disabled?: boolean
}

const getClassName = ({value, disabled}: Props) => {
    if (disabled) {
        return css.grey
    }

    if (value < 1) {
        return css.danger
    } else if (value < 10) {
        return css.grey
    }

    return css.success
}

export function ProductStockQuantity({value, disabled}: Props) {
    return (
        <span className={getClassName({value, disabled})}>
            {new Intl.NumberFormat().format(value)}
        </span>
    )
}
