import React from 'react'
import _isArray from 'lodash/isArray'

import css from './Legend.less'

export type Label = {
    aheadLabel?: string
    name: string
    background: string
    shape?: 'rectangle' | 'square' | 'circle'
}

type Props = {
    labels: Array<Label>
}

export default function Legend({labels}: Props) {
    if (!_isArray(labels) || !labels.length) {
        return null
    }

    return (
        <div className={css.legends}>
            {labels.map((label) => (
                <span className={`${css.label} mr-4 mb-2`} key={label.name}>
                    {label.aheadLabel && (
                        <span className="mr-2">{label.aheadLabel}</span>
                    )}
                    <span
                        className={`${css[label.shape || 'circle']} mr-2`}
                        style={{background: label.background}}
                    />
                    {label.name}
                </span>
            ))}
        </div>
    )
}
