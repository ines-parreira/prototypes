import { useEffect } from 'react'

import { DebugMenu, DebugMenuItem } from '@repo/debug'
import {
    NavigationSidebarTooltip,
    SidebarContent,
    SidebarFooter,
    SidebarRoot,
    useSidebar,
    useSidebarButtonSize,
    useSidebarShortcuts,
} from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { ViewCountDebugPanel } from '@repo/views'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { Box, Button, Separator, TooltipContent } from '@gorgias/axiom'
import { useCopilotPanel } from '@gorgias/copilot'

import { AskGaiaButton } from 'copilot'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
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
    const isCopilotEnabled = useCopilotEnabled()
    const { isOpen: isCopilotOpen, setIsOpen: setCopilotOpen } =
        useCopilotPanel()

    useSidebarShortcuts()

    useEffect(() => {
        if (!isCopilotEnabled) return
        shortcutManager.bind('Copilot', {
            TOGGLE_COPILOT: {
                action: (e) => {
                    e.preventDefault()
                    setCopilotOpen(!isCopilotOpen)
                },
            },
        })
        return () => {
            shortcutManager.unbind('Copilot')
        }
    }, [isCopilotEnabled, isCopilotOpen, setCopilotOpen])

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
                                as="a"
                                href={
                                    prevNonStickyPathname ??
                                    productConfig[Product.Inbox].defaultPath
                                }
                                icon="arrow-left"
                                size="sm"
                                variant="secondary"
                                aria-label="Go back"
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
                                shortcut="["
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

            <AskGaiaButton />

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
                        placement="top"
                        trigger={
                            <Button
                                as="a"
                                href={
                                    productConfig[Product.Settings].defaultPath
                                }
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
                            placement="top"
                            trigger={
                                <Button
                                    icon="help-circle"
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
