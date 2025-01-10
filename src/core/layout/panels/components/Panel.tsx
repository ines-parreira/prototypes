import React, {useMemo} from 'react'
import type {ReactNode} from 'react'

import usePanel from '../hooks/usePanel'
import type {PanelConfig} from '../types'

import Handle from './Handle'
import css from './Panel.less'

type Props = {
    children: ReactNode
    config: PanelConfig
    name: string
}

export default function Panel({children, config, name}: Props) {
    const {resizer, size} = usePanel(name, config)

    const style = useMemo(() => ({width: size}), [size])

    return (
        <>
            {!!resizer && <Handle onResizeStart={resizer} />}
            <div className={css.panel} data-panel-name={name} style={style}>
                {children}
            </div>
        </>
    )
}
