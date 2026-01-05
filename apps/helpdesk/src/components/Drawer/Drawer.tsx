import { useEffect, useLayoutEffect } from 'react'
import type { ComponentProps } from 'react'

import { Drawer as VaulDrawer } from 'vaul'

type DrawerRootProps = ComponentProps<typeof VaulDrawer.Root> & {
    // to correctly render and focus popovers used within the drawer set this to true
    withPopovers?: boolean
}

function DrawerRoot({
    modal = false,
    withPopovers = false,
    ...props
}: DrawerRootProps) {
    // Applying this while the actual library level fix (https://github.com/emilkowalski/vaul/pull/576) is not yet merged
    // for non-modal states (ie when you want the user to be able to interact with the page while the drawer is open)
    useEffect(() => {
        if (!modal && props.open) {
            window.requestAnimationFrame(() => {
                document.body.style.pointerEvents = 'auto'
            })
        }
    }, [props.open, modal])

    // Fix for focus trap in popovers and their inputs - https://github.com/emilkowalski/vaul/issues/497
    useLayoutEffect(() => {
        if (!withPopovers) {
            return
        }

        document.addEventListener('focusin', (e) =>
            e.stopImmediatePropagation(),
        )
        document.addEventListener('focusout', (e) =>
            e.stopImmediatePropagation(),
        )
    }, [withPopovers])

    return (
        <VaulDrawer.Root
            modal={modal}
            noBodyStyles={withPopovers ? true : undefined}
            disablePreventScroll={withPopovers ? false : undefined}
            {...props}
        />
    )
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<SidePanel />` from @gorgias/axiom instead.
 * @date 2026-01-05
 * @type ui-kit-migration
 */
export const Drawer = { ...VaulDrawer, Root: DrawerRoot }
