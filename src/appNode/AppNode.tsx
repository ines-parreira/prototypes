import cn from 'classnames'
import React, {ReactNode, useState} from 'react'

import css from './AppNode.less'
import AppNodeContext from './AppNodeContext'

type Props = {
    children: ReactNode
    className?: string
}

export default function AppNode({children, className}: Props) {
    const [appNode, setAppNode] = useState<HTMLDivElement | null>(null)

    return (
        <div ref={setAppNode} className={cn(css.app, className)}>
            <AppNodeContext.Provider value={appNode}>
                {children}
            </AppNodeContext.Provider>
        </div>
    )
}
