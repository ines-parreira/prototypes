import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useSidebar } from '@repo/navigation'

import { Button, Menu, MenuSection } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
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
    const { isCollapsed } = useSidebar()
    const isAiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled)
    const { hasAccess } = useAiAgentAccess()

    return (
        <Menu
            trigger={
                isCollapsed ? (
                    <Button
                        icon={selectedItem.icon}
                        variant="tertiary"
                        size="sm"
                    />
                ) : (
                    <Button
                        variant="tertiary"
                        leadingSlot={selectedItem.icon}
                        trailingSlot="arrow-chevron-down"
                    >
                        {selectedItem.name}
                    </Button>
                )
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
                    requiresUpgrade={!hasAccess}
                />
                {isAiJourneyEnabled && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Marketing]}
                    />
                )}
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
