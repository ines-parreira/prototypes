import React, {ReactNode} from 'react'

import css from './InstallationTab.less'

type Props = {
    children: ReactNode
}

const InstallationTab = ({children}: Props) => {
    return <div className={css.container}>{children}</div>
}

export default InstallationTab
