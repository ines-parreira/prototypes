import {
    SidebarContent,
    SidebarFooter,
    SidebarRoot,
    useSidebar,
} from '@repo/navigation'
import { history } from '@repo/routing'

import { Box, Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import UserItem from 'common/navigation/components/UserItem'
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

    const CurrentContent = currentProduct.sidebar
    const isSticky =
        currentProduct.sidebarContentType === SidebarContentType.Sticky

    return (
        <SidebarRoot>
            <Box
                justifyContent="space-between"
                alignItems="center"
                flexDirection={isCollapsed ? 'column-reverse' : 'row'}
                gap="md"
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
                                size="sm"
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
                <CurrentContent />
            </SidebarContent>

            <SidebarFooter>
                <UserItem />
                <Box
                    gap="xxxxs"
                    alignItems="center"
                    flexDirection={isCollapsed ? 'column' : 'row'}
                >
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
                                size="sm"
                            />
                        }
                    >
                        <TooltipContent title="Settings" />
                    </Tooltip>
                    <Tooltip
                        placement="right"
                        trigger={
                            <Button
                                icon="circle-help"
                                onClick={toggleChat}
                                variant="tertiary"
                                size="sm"
                                aria-label="Open chat"
                            />
                        }
                    >
                        <TooltipContent title="Open chat" />
                    </Tooltip>
                    <NavigationSidebarNotificationsButton />
                </Box>
            </SidebarFooter>
        </SidebarRoot>
    )
}
