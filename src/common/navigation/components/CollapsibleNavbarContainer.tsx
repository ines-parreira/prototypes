import React, {ComponentProps, forwardRef} from 'react'

import {useNavBar} from '../hooks/useNavBar/useNavBar'

import css from './CollapsibleNavbarContainer.less'

type CollapsibleNavbarContainerProps = ComponentProps<'div'>

export const CollapsibleNavbarContainer = forwardRef<
    HTMLDivElement,
    CollapsibleNavbarContainerProps
>(function CollapsibleNavbarContainer({children, ...props}, ref) {
    const {navBarDisplay, onOverlayEnter, onNavHover, onNavLeave} = useNavBar()

    return (
        <>
            <div
                data-name="navbar-overlay"
                data-display={navBarDisplay}
                className={css.overlay}
                onMouseEnter={() => {
                    onOverlayEnter()
                    onNavLeave()
                }}
            />
            <div
                ref={ref}
                {...props}
                data-name="navbar-collapsible-container"
                data-display={navBarDisplay}
                onMouseEnter={onNavHover}
                className={css.container}
            >
                {children}
            </div>
        </>
    )
})
