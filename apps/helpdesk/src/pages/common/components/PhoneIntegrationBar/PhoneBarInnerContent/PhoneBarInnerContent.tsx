import type { ReactNode } from 'react'

import css from './PhoneBarInnerContent.less'

type Props = {
    children: ReactNode
}

export function PhoneBarInnerContent({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
