import React from 'react'
import classnames from 'classnames'

import {getInfobarMinWidth, getInfobarWidth} from '../../infobar/utils.js'

import css from './PhoneInfobarWrapper.less'

type Props = {
    primary?: boolean
    children: React.ReactNode
}

export default function PhoneInfobarWrapper({
    primary,
    children,
}: Props): JSX.Element {
    const width = (getInfobarWidth() || getInfobarMinWidth()) as number

    return (
        <div
            style={{width: `${width}px`}}
            className={classnames(css.container, {[css.primary]: primary})}
        >
            <div className={css.inner}>{children}</div>
        </div>
    )
}
