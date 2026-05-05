import { DebugMenu, DebugMenuItem } from '@repo/debug'
import { useIsMobileResolution } from '@repo/hooks'
import {
    NavigationSidebarTooltip,
    SidebarContent,
    SidebarFooter,
    SidebarRoot,
    useSidebar,
    useSidebarButtonSize,
    useSidebarShortcuts,
} from '@repo/navigation'
import { history } from '@repo/routing'
import { ViewCountDebugPanel } from '@repo/views'

import { Box, Button, Separator, TooltipContent } from '@gorgias/axiom'

import { useIsChatReady } from 'hooks/useIsChatReady'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { usePreviousProductNavigation } from 'routes/hooks/usePreviousProductNavigation'
import { NavigationSidebarNotificationsPopover } from 'routes/layout/NavigationSidebarNotificationsPopover'
import { NavigationSidebarSpotlightButton } from 'routes/layout/NavigationSidebarSpotlightButton'
import {
    Product,
    productConfig,
    SidebarContentType,
} from 'routes/layout/productConfig'
import { SidebarProductHeader } from 'routes/layout/SidebarProductHeader'
import { UserMenu } from 'routes/layout/UserMenu'
import { toggleChat } from 'utils'

export function NavigationSidebar() {
    const currentProduct = useCurrentRouteProduct()
    const prevNonStickyPathname = usePreviousProductNavigation()
    const { isCollapsed, toggleCollapse } = useSidebar()
    const buttonSize = useSidebarButtonSize()
    const isChatReady = useIsChatReady()
    const isMobileResolution = useIsMobileResolution()

    useSidebarShortcuts()

    const CurrentContent = currentProduct.sidebar
    const isSticky =
        currentProduct.sidebarContentType === SidebarContentType.Sticky

    return (
        <SidebarRoot>
            <Box
                justifyContent="space-between"
                alignItems="center"
                flexDirection={isCollapsed ? 'column' : 'row'}
                gap={isCollapsed ? 'sm' : 'xxxs'}
                pl="xs"
                pr="xs"
            >
                {isSticky ? (
                    <Box
                        gap="xxxxs"
                        alignItems="center"
                        flexDirection={isCollapsed ? 'column' : 'row'}
                    >
                        {!isCollapsed && (
                            <Button
                                icon="arrow-left"
                                size="sm"
                                variant="secondary"
                                aria-label="Go back"
                                onClick={() =>
                                    history.push(
                                        prevNonStickyPathname ??
                                            productConfig[Product.Inbox]
                                                .defaultPath,
                                    )
                                }
                            />
                        )}
                        <SidebarProductHeader
                            selectedItem={{
                                ...currentProduct,
                                icon: isCollapsed
                                    ? currentProduct.icon
                                    : undefined,
                            }}
                        />
                    </Box>
                ) : (
                    <SidebarProductHeader selectedItem={currentProduct} />
                )}

                <Box gap="xxxs" flexDirection={isCollapsed ? 'column' : 'row'}>
                    <NavigationSidebarNotificationsPopover />
                    <NavigationSidebarSpotlightButton />

                    {!isMobileResolution && (
                        <NavigationSidebarTooltip
                            placement="bottom"
                            trigger={
                                <Button
                                    icon={
                                        isCollapsed
                                            ? 'system-bar-collapse'
                                            : 'system-bar-expand'
                                    }
                                    size={buttonSize}
                                    variant="tertiary"
                                    onClick={toggleCollapse}
                                    aria-label={
                                        isCollapsed
                                            ? 'Expand sidebar'
                                            : 'Collapse sidebar'
                                    }
                                />
                            }
                        >
                            <TooltipContent
                                shortcut={'['}
                                title={isCollapsed ? 'Expand' : 'Collapse'}
                            />
                        </NavigationSidebarTooltip>
                    )}
                </Box>
            </Box>

            <SidebarContent>
                {isCollapsed && <Separator />}
                {!!CurrentContent && <CurrentContent />}
            </SidebarContent>

            <SidebarFooter>
                <UserMenu />
                <Box
                    gap="xxxxs"
                    alignItems="center"
                    flexDirection={isCollapsed ? 'column' : 'row'}
                >
                    <DebugMenu>
                        <DebugMenuItem
                            id="view-counts"
                            icon="list-ordered"
                            label="View count refresh"
                        >
                            <ViewCountDebugPanel />
                        </DebugMenuItem>
                    </DebugMenu>
                    <NavigationSidebarTooltip
                        placement="right"
                        trigger={
                            <Button
                                onClick={() => {
                                    history.push(
                                        productConfig[Product.Settings]
                                            .defaultPath,
                                    )
                                }}
                                icon={productConfig[Product.Settings].icon}
                                variant={
                                    currentProduct.id === Product.Settings
                                        ? 'secondary'
                                        : 'tertiary'
                                }
                                size={buttonSize}
                            />
                        }
                    >
                        <TooltipContent title="Settings" />
                    </NavigationSidebarTooltip>
                    {isChatReady && (
                        <NavigationSidebarTooltip
                            placement="right"
                            trigger={
                                <Button
                                    icon="circle-help"
                                    onClick={toggleChat}
                                    variant="tertiary"
                                    size={buttonSize}
                                    aria-label="Open chat"
                                />
                            }
                        >
                            <TooltipContent title="Open chat" />
                        </NavigationSidebarTooltip>
                    )}
                </Box>
            </SidebarFooter>
        </SidebarRoot>
    )
}
