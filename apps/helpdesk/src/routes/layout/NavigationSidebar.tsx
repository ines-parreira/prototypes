import {
    SidebarContent,
    SidebarFooter,
    SidebarRoot,
    useSidebar,
} from '@repo/navigation'
import { history } from '@repo/routing'

import { Box, Button } from '@gorgias/axiom'

import UserItem from 'common/navigation/components/UserItem'
import { HELP_DOCS_BASE_URL } from 'config'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { NavigationSidebarNotificationsButton } from 'routes/layout/NavigationSidebarNotificationsButton'
import { NavigationSidebarSpotlightButton } from 'routes/layout/NavigationSidebarSpotlightButton'
import {
    Product,
    productConfig,
    SidebarContentType,
} from 'routes/layout/productConfig'
import { SidebarProductHeader } from 'routes/layout/SidebarProductHeader'

export function NavigationSidebar() {
    const currentProduct = useCurrentRouteProduct()
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
                                onClick={() =>
                                    history.push(
                                        productConfig[Product.Home].defaultPath,
                                    )
                                }
                            />
                        )}
                        <SidebarProductHeader
                            selectedItem={{
                                name: currentProduct.name,
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
                            isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                        }
                    />
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
                    <Button
                        onClick={() => {
                            history.push(
                                productConfig[Product.Settings].defaultPath,
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
                    <Button
                        icon="circle-help"
                        as="a"
                        href={HELP_DOCS_BASE_URL}
                        variant="tertiary"
                        size="sm"
                    />
                    <NavigationSidebarNotificationsButton />
                </Box>
            </SidebarFooter>
        </SidebarRoot>
    )
}
