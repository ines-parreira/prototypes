// @flow

import React, {type Node} from 'react'

import css from './CardHeaderYotpoRatingThumbs.less'

type Props = {
    children: Node,
    label?: string,
}

export function CardHeaderYotpoRatingThumbs({children, label}: Props) {
    return (
        <span className={css.container}>
            {label ? <span className={css.label}>{label}: </span> : null}
            <strong>{children}</strong>
            {parseFloat(children) > 2.5 ? (
                <span className={`material-icons ${css.greenThumb}`}>
                    thumb_up{' '}
                </span>
            ) : (
                <span className={`material-icons ${css.redThumb}`}>
                    thumb_down{' '}
                </span>
            )}
        </span>
    )
}
