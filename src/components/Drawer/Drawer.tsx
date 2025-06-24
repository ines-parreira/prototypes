import { type ComponentProps, useEffect } from 'react'

import { Drawer as VaulDrawer } from 'vaul'

function DrawerRoot({
    modal = false,
    ...props
}: ComponentProps<typeof VaulDrawer.Root>) {
    // Applying this while the actual library level fix (https://github.com/emilkowalski/vaul/pull/576) is not yet merged
    // for non-modal states (ie when you want the user to be able to interact with the page while the drawer is open)
    useEffect(() => {
        if (!modal && props.open) {
            window.requestAnimationFrame(() => {
                document.body.style.pointerEvents = 'auto'
            })
        }
    }, [props.open, modal])

    return <VaulDrawer.Root modal={modal} {...props} />
}

export const Drawer = { ...VaulDrawer, Root: DrawerRoot }
