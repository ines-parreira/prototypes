import { useState } from 'react'
import type { ReactNode } from 'react'

import Context from '../Context'
import { useContextValue } from '../hooks/useContextValue'

import css from './Panels.less'

type Props = {
    children: ReactNode
    size: number
}

export function Panels({ children, size }: Props) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const ctx = useContextValue(container, size)

    return (
        <Context.Provider value={ctx}>
            <div
                ref={setContainer}
                className={css.panels}
                style={{ width: ctx.totalSize }}
            >
                {children}
            </div>
        </Context.Provider>
    )
}
