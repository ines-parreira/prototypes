import React from 'react'

import css from './CardHeaderYotpoRatingThumbs.less'

type Props = {
    value?: string
    label?: string
}

export function CardHeaderYotpoRatingThumbs({value, label}: Props) {
    const missingData = typeof value === 'undefined'
    let thumb = null
    if (!missingData) {
        thumb =
            parseFloat(value!) > 2.5 ? (
                <span className={`material-icons ${css.greenThumb}`}>
                    thumb_up{' '}
                </span>
            ) : (
                <span className={`material-icons ${css.redThumb}`}>
                    thumb_down{' '}
                </span>
            )
    }
    return (
        <span
            className={`${css.container} ${missingData ? css.missingData : ''}`}
        >
            {label ? <span className={css.label}>{label}: </span> : null}
            <strong>{missingData ? 'N/A' : value}</strong>
            {thumb}
        </span>
    )
}
