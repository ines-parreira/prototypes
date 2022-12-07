import React from 'react'

import css from './ProductStockQuantity.less'

type Props = {
    value: number
}

export function ProductStockQuantity({value}: Props) {
    let className
    if (value < 1) {
        className = css.danger
    } else if (value < 10) {
        className = css.grey
    } else {
        className = css.success
    }

    return (
        <span className={className}>
            {new Intl.NumberFormat().format(value) + ' in stock'}
        </span>
    )
}
