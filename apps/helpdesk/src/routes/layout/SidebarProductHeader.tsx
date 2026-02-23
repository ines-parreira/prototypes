import { Button, Menu, MenuSection } from '@gorgias/axiom'

import { Product, productConfig } from 'routes/layout/productConfig'
import { SidebarProductHeaderMenuItem } from 'routes/layout/SidebarProductHeaderMenuItem'

type SelectedItem = {
    name: string
    icon?: string
}

type SidebarProductHeaderProps = {
    selectedItem: SelectedItem
}

export function SidebarProductHeader({
    selectedItem,
}: SidebarProductHeaderProps) {
    return (
        <Menu
            trigger={
                <Button
                    variant="tertiary"
                    leadingSlot={selectedItem.icon}
                    trailingSlot="arrow-chevron-down"
                >
                    {selectedItem.name}
                </Button>
            }
        >
            <MenuSection id={'home'}>
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Home]}
                />
            </MenuSection>
            <MenuSection id={'primary-nav-items'}>
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Inbox]}
                />
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.AiAgent]}
                />
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Marketing]}
                />
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Analytics]}
                />
            </MenuSection>
            <MenuSection id={'secondary-nav-items'}>
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Workflows]}
                />
                <SidebarProductHeaderMenuItem
                    item={productConfig[Product.Customers]}
                />
            </MenuSection>
        </Menu>
    )
}
