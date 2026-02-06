import type { ReactNode } from 'react'

import css from './InfobarNavigationContainer.less'

type InfobarNavigationContainerProps = {
    children: ReactNode
}

export function InfobarNavigationContainer({
    children,
}: InfobarNavigationContainerProps) {
    return <div className={css.container}>{children}</div>
}
