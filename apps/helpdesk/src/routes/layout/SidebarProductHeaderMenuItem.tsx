import { Link } from 'react-router-dom'

import { Box, IconBox, MenuItem, Tag } from '@gorgias/axiom'

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
            as={Link}
            to={item.defaultPath}
            label={
                <Box width={162}>
                    {requiresUpgrade ? (
                        <Box alignItems="center" gap="xxs">
                            <div>{item.name}</div>
                            <Tag color="green" size="sm">
                                Upgrade
                            </Tag>
                        </Box>
                    ) : (
                        item.name
                    )}
                </Box>
            }
            leadingSlot={({ isSelected }) => (
                <IconBox
                    icon={item.icon}
                    color={isSelected ? 'accent' : 'grey'}
                    variant="secondary"
                />
            )}
        />
    )
}
