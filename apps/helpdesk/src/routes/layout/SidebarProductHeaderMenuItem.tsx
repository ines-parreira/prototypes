import { history } from '@repo/routing'

import { Icon, MenuItem } from '@gorgias/axiom'

import type { ProductConfig } from 'routes/layout/productConfig'

type SidebarProductHeaderMenuItemProps = {
    item: ProductConfig
}

export function SidebarProductHeaderMenuItem({
    item,
}: SidebarProductHeaderMenuItemProps) {
    return (
        <MenuItem
            key={item.id}
            label={item.name}
            onAction={() => {
                history.push(item.defaultPath)
            }}
            caption={item.description}
            leadingSlot={<Icon name={item.icon} />}
        />
    )
}
