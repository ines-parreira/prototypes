import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useSidebar } from '@repo/navigation'
import { UserRole } from '@repo/permissions'
import { useCurrentUserRole } from '@repo/users'

import type { IconName } from '@gorgias/axiom'
import {
    Box,
    Button,
    DropdownIcon,
    Heading,
    IconBox,
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
    const { isAdmin, hasRole } = useCurrentUserRole()

    const icon =
        selectedItem.icon != null ? (
            <IconBox
                icon={selectedItem.icon}
                color={
                    selectedItem.productType === 'primary' ? 'accent' : 'grey'
                }
                variant="primary"
            />
        ) : null

    return (
        <Menu
            selectedKeys={[selectedItem.id]}
            selectionMode="single"
            trigger={({ isOpen }) =>
                isCollapsed && selectedItem.icon ? (
                    <Tooltip
                        placement="right"
                        trigger={<Button icon={icon} variant="tertiary" />}
                    >
                        <TooltipContent title={selectedItem.name} />
                    </Tooltip>
                ) : (
                    <Button
                        variant="tertiary"
                        leadingSlot={icon}
                        trailingSlot={<DropdownIcon isOpen={isOpen} />}
                    >
                        <Box pl="xxxxs">
                            <Heading size="sm">{selectedItem.name}</Heading>
                        </Box>
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
                {hasRole(UserRole.Agent) && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.AiAgent]}
                        requiresUpgrade={!hasAccess}
                    />
                )}
                {isAiJourneyEnabled && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Marketing]}
                    />
                )}
                {isAdmin && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Convert]}
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
