import type { ReactNode } from 'react'
import React from 'react'

import css from './InstallationStep.less'

type Props = {
    index: number
    children: ReactNode
}

const InstallationStep = ({ index, children }: Props) => {
    return (
        <div className={css.container}>
            <div className={css.bullet}>{index}</div>
            <div>{children}</div>
        </div>
    )
}

export default InstallationStep
