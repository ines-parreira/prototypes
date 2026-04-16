import { DebugMenu, DebugMenuItem } from '@repo/debug'
import { EvaluationsDebugPanel } from '@repo/feature-flags'
import {
    SidebarContent,
    SidebarFooter,
    SidebarRoot,
    useSidebar,
    useSidebarButtonSize,
    useSidebarShortcuts,
} from '@repo/navigation'
import { history } from '@repo/routing'

import { Box, Button, Separator, Tooltip, TooltipContent } from '@gorgias/axiom'

import UserItem from 'common/navigation/components/UserItem'
import { useIsChatReady } from 'hooks/useIsChatReady'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { usePreviousProductNavigation } from 'routes/hooks/usePreviousProductNavigation'
import { NavigationSidebarNotificationsButton } from 'routes/layout/NavigationSidebarNotificationsButton'
import { NavigationSidebarSpotlightButton } from 'routes/layout/NavigationSidebarSpotlightButton'
import {
    Product,
    productConfig,
    SidebarContentType,
} from 'routes/layout/productConfig'
import { SidebarProductHeader } from 'routes/layout/SidebarProductHeader'
import { toggleChat } from 'utils'

export function NavigationSidebar() {
    const currentProduct = useCurrentRouteProduct()
    const prevNonStickyPathname = usePreviousProductNavigation()
    const { isCollapsed, toggleCollapse } = useSidebar()
    const buttonSize = useSidebarButtonSize()
    const isChatReady = useIsChatReady()

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

                <Box
                    gap="xxxs"
                    flexDirection={isCollapsed ? 'column-reverse' : 'row'}
                >
                    <NavigationSidebarNotificationsButton />
                    <NavigationSidebarSpotlightButton />

                    <Tooltip
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
                        <TooltipContent shortcut={'['} />
                    </Tooltip>
                </Box>
            </Box>

            <SidebarContent>
                {isCollapsed && <Separator />}
                {!!CurrentContent && <CurrentContent />}
            </SidebarContent>

            <SidebarFooter>
                <UserItem />
                <Box
                    gap="xxxxs"
                    alignItems="center"
                    flexDirection={isCollapsed ? 'column' : 'row'}
                >
                    <DebugMenu>
                        <DebugMenuItem
                            id="evaluations"
                            icon="nav-flag"
                            label="Flag evaluations"
                        >
                            <EvaluationsDebugPanel />
                        </DebugMenuItem>
                    </DebugMenu>
                    <Tooltip
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
                    </Tooltip>
                    {isChatReady && (
                        <Tooltip
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
                        </Tooltip>
                    )}
                </Box>
            </SidebarFooter>
        </SidebarRoot>
    )
}
