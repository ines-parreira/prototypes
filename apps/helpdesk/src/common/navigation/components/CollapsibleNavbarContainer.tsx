import type { ComponentProps } from 'react'
import React, { forwardRef } from 'react'

import { useNavBar } from '../hooks/useNavBar/useNavBar'

import css from './CollapsibleNavbarContainer.less'

type CollapsibleNavbarContainerProps = ComponentProps<'div'>

export const CollapsibleNavbarContainer = forwardRef<
    HTMLDivElement,
    CollapsibleNavbarContainerProps
>(function CollapsibleNavbarContainer({ children, ...props }, ref) {
    const { navBarDisplay, onOverlayHover, onNavHover } = useNavBar()

    return (
        <>
            <div
                data-name="navbar-overlay"
                data-display={navBarDisplay}
                className={css.overlay}
                onMouseOver={onOverlayHover}
                onFocus={onOverlayHover}
            />
            <div
                ref={ref}
                {...props}
                data-name="navbar-collapsible-container"
                data-display={navBarDisplay}
                onMouseOver={onNavHover}
                onFocus={onNavHover}
                className={css.container}
            >
                {children}
            </div>
        </>
    )
})
