import type { ReactNode } from 'react'
import React from 'react'

import css from './InstallationTab.less'

type Props = {
    children: ReactNode
}

const InstallationTab = ({ children }: Props) => {
    return <div className={css.container}>{children}</div>
}

export default InstallationTab
