import type { ReactNode } from 'react'

import { CollapsibleNavbarContainer } from 'common/navigation/components/CollapsibleNavbarContainer'
import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'

type Props = {
    children: ReactNode
}

export function CollapsibleNavBarWrapper({ children }: Props) {
    const { navBarDisplay, onNavHover, onNavLeave } = useNavBar()

    if (navBarDisplay === NavBarDisplayMode.Open) {
        return (
            <div
                data-name="navbar-open-container"
                onMouseOver={onNavHover}
                onFocus={onNavHover}
                onMouseLeave={onNavLeave}
                style={{ height: '100%' }}
            >
                {children}
            </div>
        )
    }

    return <CollapsibleNavbarContainer>{children}</CollapsibleNavbarContainer>
}
