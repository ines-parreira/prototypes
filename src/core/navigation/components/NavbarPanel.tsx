import React from 'react'
import type {ReactNode} from 'react'

import {Panel} from 'core/layout/panels'

const panelConfig = {
    defaultSize: 238,
    minSize: 200,
    maxSize: 350,
}

type Props = {
    children: ReactNode
}

export default function NavbarPanel({children}: Props) {
    return (
        <Panel name="navigation" config={panelConfig}>
            {children}
        </Panel>
    )
}
