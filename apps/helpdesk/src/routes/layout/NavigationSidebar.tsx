import { SidebarContent, SidebarFooter, SidebarRoot } from '@repo/navigation'
import { history } from '@repo/routing'

import { Box, Button } from '@gorgias/axiom'

import UserItem from 'common/navigation/components/UserItem'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
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
                    <Box gap="sm" alignItems="center">
                        <Button
                            icon="arrow-left"
                            variant="tertiary"
                            onClick={() =>
                                history.push(
                                    productConfig[Product.Home].defaultPath,
                                )
                            }
                        />
                        <Button variant="tertiary">
                            {currentProduct.name}
                        </Button>
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
                <Button
                    onClick={() => {
                        history.push(
                            productConfig[Product.Settings].defaultPath,
                        )
                    }}
                    icon={productConfig[Product.Settings].icon}
                    variant="tertiary"
                />
            </SidebarFooter>
        </SidebarRoot>
    )
}
