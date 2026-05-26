import { useSidebar } from '@repo/navigation'

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

import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { BASE_STATS_PATH } from 'routes/constants'
import type { ProductConfig } from 'routes/layout/productConfig'
import { Product, productConfig } from 'routes/layout/productConfig'
import { SidebarProductHeaderMenuItem } from 'routes/layout/SidebarProductHeaderMenuItem'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'

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
    const {
        canAccessAiAgent,
        aiAgentRequiresUpgrade,
        isAiJourneyVisible,
        isConvertVisible,
    } = useNavigationProducts()
    const { isModuleRestrictedToCurrentUser } = useReportChartRestrictions()
    const isAnalyticsRestricted =
        isModuleRestrictedToCurrentUser(BASE_STATS_PATH)

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
                        trigger={
                            <Button icon={icon} variant="tertiary" size="sm" />
                        }
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
                {canAccessAiAgent && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.AiAgent]}
                        requiresUpgrade={aiAgentRequiresUpgrade}
                    />
                )}
                {isAiJourneyVisible && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Marketing]}
                    />
                )}
                {isConvertVisible && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Convert]}
                    />
                )}
                {!isAnalyticsRestricted && (
                    <SidebarProductHeaderMenuItem
                        item={productConfig[Product.Analytics]}
                    />
                )}
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
