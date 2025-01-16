import React from 'react'
import type {ReactNode} from 'react'

import {CollapsibleNavbarContainer} from 'common/navigation/components/CollapsibleNavbarContainer'
import {NavBarDisplayMode} from 'common/navigation/hooks/useNavBar/context'
import {useNavBar} from 'common/navigation/hooks/useNavBar/useNavBar'
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
    const {navBarDisplay} = useNavBar()

    if (navBarDisplay === NavBarDisplayMode.Open) {
        return (
            <Panel name="navigation" config={panelConfig}>
                {children}
            </Panel>
        )
    }

    return <CollapsibleNavbarContainer>{children}</CollapsibleNavbarContainer>
}
