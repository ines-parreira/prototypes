import React, {ReactNode} from 'react'

import css from './Toast.less'

type Props = {
    children: ReactNode
}

export default function Toast({children}: Props) {
    return <div className={css.container}>{children}</div>
}
