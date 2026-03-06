import { history } from '@repo/routing'

import { Box, Icon, MenuItem, Tag } from '@gorgias/axiom'

import type { ProductConfig } from 'routes/layout/productConfig'

type SidebarProductHeaderMenuItemProps = {
    item: ProductConfig
    requiresUpgrade?: boolean
}

export function SidebarProductHeaderMenuItem({
    item,
    requiresUpgrade,
}: SidebarProductHeaderMenuItemProps) {
    return (
        <MenuItem
            key={item.id}
            label={
                requiresUpgrade ? (
                    <Box alignItems="center" gap="xxs">
                        <div>{item.name}</div>
                        <Tag color="green" size="sm">
                            Upgrade
                        </Tag>
                    </Box>
                ) : (
                    item.name
                )
            }
            onAction={() => {
                history.push(item.defaultPath)
            }}
            caption={item.description}
            leadingSlot={<Icon name={item.icon} />}
        />
    )
}
