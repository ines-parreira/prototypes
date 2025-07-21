import React, { ReactNode } from 'react'

import css from './PaywallViewRightContainer.less'

type Props = {
    children: ReactNode
}

export default function PaywallViewRightContainer({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
