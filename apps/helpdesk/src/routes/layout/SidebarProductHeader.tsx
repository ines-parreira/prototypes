import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useSidebar } from '@repo/navigation'

import type { IconName } from '@gorgias/axiom'
import {
    Box,
    Button,
    Heading,
    Icon,
    Menu,
    MenuSection,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { ProductConfig } from 'routes/layout/productConfig'
import { Product, productConfig } from 'routes/layout/productConfig'
import { SidebarProductHeaderMenuItem } from 'routes/layout/SidebarProductHeaderMenuItem'

type SelectedItem = Omit<ProductConfig, 'icon'> & {
    icon?: IconName
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

    const icon =
        selectedItem.icon != null ? (
            <Icon
                name={selectedItem.icon}
                color={selectedItem.color}
                withBackground
            />
        ) : null

    return (
        <Menu
            selectedKeys={[selectedItem.id]}
            selectionMode="single"
            trigger={
                isCollapsed && selectedItem.icon ? (
                    <Tooltip
                        placement="right"
                        trigger={
                            <Button
                                icon={icon}
                                variant="tertiary"
                                color={selectedItem.color}
                            />
                        }
                    >
                        <TooltipContent title={selectedItem.name} />
                    </Tooltip>
                ) : (
                    <Button
                        variant="tertiary"
                        leadingSlot={
                            icon ? <Box pr="xs">{icon}</Box> : undefined
                        }
                        trailingSlot="arrow-chevron-down"
                    >
                        <Heading>{selectedItem.name}</Heading>
                    </Button>
                )
            }
        >
            <MenuSection id={'home-section'}>
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
