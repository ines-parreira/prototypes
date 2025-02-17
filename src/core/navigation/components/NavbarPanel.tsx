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
    prioritise: true,
}

type Props = {
    children: ReactNode
}

export default function NavbarPanel({children}: Props) {
    const {navBarDisplay, onNavHover, onNavLeave} = useNavBar()

    if (navBarDisplay === NavBarDisplayMode.Open) {
        return (
            <Panel name="navigation" config={panelConfig}>
                <div
                    data-name="navbar-open-container"
                    onMouseOver={onNavHover}
                    onFocus={onNavHover}
                    onMouseLeave={onNavLeave}
                    style={{height: '100%'}}
                >
                    {children}
                </div>
            </Panel>
        )
    }

    return <CollapsibleNavbarContainer>{children}</CollapsibleNavbarContainer>
}
