// @flow

import React from 'react'

import css from './CardHeaderIcon.less'

type Props = {
    src: string,
    alt: string,
}

export function CardHeaderIcon({src, alt}: Props) {
    return <img src={src} alt={alt} className={css.container} />
}
