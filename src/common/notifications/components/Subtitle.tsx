import React from 'react'
import type {ReactNode} from 'react'

import css from './Subtitle.less'

type Props = {
    children: ReactNode
}

export default function Subtitle({children}: Props) {
    return <p className={css.subtitle}>{children}</p>
}
