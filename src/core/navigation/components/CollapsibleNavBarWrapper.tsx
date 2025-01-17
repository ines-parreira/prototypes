import React from 'react'
import type {ReactNode} from 'react'

import {CollapsibleNavbarContainer} from 'common/navigation/components/CollapsibleNavbarContainer'
import {NavBarDisplayMode} from 'common/navigation/hooks/useNavBar/context'
import {useNavBar} from 'common/navigation/hooks/useNavBar/useNavBar'

type Props = {
    children: ReactNode
}

export function CollapsibleNavBarWrapper({children}: Props) {
    const {navBarDisplay} = useNavBar()

    if (navBarDisplay === NavBarDisplayMode.Open) {
        return <>{children}</>
    }

    return <CollapsibleNavbarContainer>{children}</CollapsibleNavbarContainer>
}
