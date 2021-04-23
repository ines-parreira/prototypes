// @flow

import React, {type Node} from 'react'

import css from './CardHeaderYotpoRatingThumbs.less'

type Props = {
    children: Node,
    label?: string,
}

export function CardHeaderYotpoRatingThumbs({children, label}: Props) {
    const missingData = typeof children === 'undefined'
    let thumb = null
    if (!missingData) {
        thumb =
            parseFloat(children) > 2.5 ? (
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
            <strong>{missingData ? 'N/A' : children}</strong>
            {thumb}
        </span>
    )
}
