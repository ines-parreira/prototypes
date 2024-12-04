import React, {ReactNode} from 'react'

import css from './PaywallView.less'

type Props = {
    children: ReactNode
}

export default function PaywallView({children}: Props) {
    return <div className={css.container}>{children}</div>
}
