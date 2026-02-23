import { SidebarContent, SidebarFooter, SidebarRoot } from '@repo/navigation'
import { history } from '@repo/routing'

import { Box, Button } from '@gorgias/axiom'

import UserItem from 'common/navigation/components/UserItem'
import { HELP_DOCS_BASE_URL } from 'config'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { NavigationSidebarNotificationsButton } from 'routes/layout/NavigationSidebarNotificationsButton'
import {
    Product,
    productConfig,
    SidebarContentType,
} from 'routes/layout/productConfig'
import { SidebarProductHeader } from 'routes/layout/SidebarProductHeader'

export function NavigationSidebar() {
    const currentProduct = useCurrentRouteProduct()

    const CurrentContent = currentProduct.sidebar
    const isSticky =
        currentProduct.sidebarContentType === SidebarContentType.Sticky

    return (
        <SidebarRoot>
            <Box justifyContent="space-between" alignItems="center">
                {isSticky ? (
                    <Box gap="xxxxs" alignItems="center">
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
                        <SidebarProductHeader
                            selectedItem={{
                                name: currentProduct.name,
                            }}
                        />
                    </Box>
                ) : (
                    <SidebarProductHeader selectedItem={currentProduct} />
                )}

                <Box gap="xxxs">
                    <Button icon="search-magnifying-glass" variant="tertiary" />
                    <Button icon="system-bar-expand" variant="tertiary" />
                </Box>
            </Box>

            <SidebarContent>
                <CurrentContent />
            </SidebarContent>

            <SidebarFooter>
                <UserItem />
                <Box gap="xxxxs" alignItems="center">
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
