import React, {ReactNode} from 'react'

import css from './HelpCenterPreview.less'

type Props = {
    children: ReactNode
    name: string
}

const HelpCenterPreview = ({children, name}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.topBar}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <h2 className={css.titleBar}>{name}</h2>
            {children}
        </div>
    )
}

export default HelpCenterPreview
