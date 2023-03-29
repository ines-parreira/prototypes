import React from 'react'
import classNames from 'classnames'

import css from './Legend.less'

type LegendItem = {
    label: string
    color: string
}

type Props = {
    className?: string
    items: LegendItem[]
}

export default function Legend({items, className}: Props) {
    return (
        <div className={classNames(css.legend, className)}>
            {items.map(({label, color}) => (
                <div className={css.legendItem} key={label}>
                    <div
                        className={css.legendCaret}
                        style={{
                            backgroundColor: color,
                        }}
                    />

                    {label}
                </div>
            ))}
        </div>
    )
}
