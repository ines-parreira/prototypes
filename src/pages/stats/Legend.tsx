import React from 'react'
import classNames from 'classnames'

import {Chart} from 'chart.js'
import CheckBox from 'pages/common/forms/CheckBox'
import css from './Legend.less'

type LegendItem = {
    label: string
    color: string
    index?: number
}

type Props = {
    className?: string
    items: LegendItem[]
    chart?: Chart
    toggleLegend?: boolean
}

export default function Legend({items, className, chart, toggleLegend}: Props) {
    return (
        <div className={classNames(css.legend, className)}>
            {items.map(({label, color, index}) =>
                toggleLegend && chart && index !== undefined ? (
                    <CheckBox
                        key={label}
                        defaultChecked
                        style={{backgroundColor: color, border: 'none'}}
                        onChange={() => {
                            chart.setDatasetVisibility(
                                index,
                                !chart.isDatasetVisible(index)
                            )
                            chart.update()
                        }}
                    >
                        {label}
                    </CheckBox>
                ) : (
                    <div className={css.legendItem} key={label}>
                        <div
                            className={css.legendCaret}
                            style={{
                                backgroundColor: color,
                            }}
                        />

                        {label}
                    </div>
                )
            )}
        </div>
    )
}
