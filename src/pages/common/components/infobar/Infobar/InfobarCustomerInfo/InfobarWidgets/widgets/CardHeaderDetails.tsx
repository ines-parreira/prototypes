import React, {ReactNode} from 'react'

import css from './CardHeaderDetails.less'

type Props = {
    children: ReactNode
}

export function CardHeaderDetails({children}: Props) {
    return <div className={css.container}>{children}</div>
}
