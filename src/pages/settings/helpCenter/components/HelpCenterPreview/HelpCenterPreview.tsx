import React, {ReactNode} from 'react'

import css from './HelpCenterPreview.less'

type Props = {
    children: ReactNode
    name: string
}

const HelpCenterPreview = ({children, name}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.topBar} />
            <div className={css.titleBar}>{name}</div>
            {children}
        </div>
    )
}

export default HelpCenterPreview
