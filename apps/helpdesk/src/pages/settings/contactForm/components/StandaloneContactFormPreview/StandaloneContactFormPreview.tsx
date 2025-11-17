import type { ReactNode } from 'react'
import React from 'react'

import css from './StandaloneContactFormPreview.less'

type Props = {
    children: ReactNode
    name?: string
}

const StandaloneContactFormPreview = ({ children, name }: Props) => {
    return (
        <div className={css.container}>
            <div className={css.topBar} />
            {name && <div className={css.titleBar}>{name}</div>}
            {children}
        </div>
    )
}

export default StandaloneContactFormPreview
