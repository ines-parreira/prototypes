import React from 'react'

import css from './CardHeaderIcon.less'

type Props = {
    src: string
    alt: string
    color?: string
}

export function CardHeaderIcon({src, alt, color = 'rgba(0, 0, 0, 0)'}: Props) {
    return (
        <img
            src={src}
            alt={alt}
            className={css.container}
            style={{
                backgroundColor: color,
            }}
        />
    )
}
