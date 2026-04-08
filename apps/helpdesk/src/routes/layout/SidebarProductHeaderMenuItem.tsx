import { Link } from 'react-router-dom'

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
            id={item.id}
            selectionStyle="neutral"
            as={Link}
            to={item.defaultPath}
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
            caption={item.description}
            leadingSlot={
                <Icon
                    name={item.icon}
                    color={item.color}
                    size="md"
                    withBackground
                />
            }
        />
    )
}
