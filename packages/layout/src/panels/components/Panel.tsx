import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { usePanel } from '../hooks/usePanel'
import type { PanelConfig } from '../types'

import css from './Panel.less'

type Props = {
    children: ReactNode
    config: PanelConfig
    name: string
}

export function Panel({ children, config, name }: Props) {
    const { size } = usePanel(name, config)

    const style = useMemo(() => ({ width: size }), [size])

    return (
        <>
            <div className={css.panel} data-panel-name={name} style={style}>
                {children}
            </div>
        </>
    )
}
