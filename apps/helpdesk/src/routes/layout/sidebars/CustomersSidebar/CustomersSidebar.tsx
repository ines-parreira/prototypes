import {
    NavigationSection,
    SidebarCollapsedGroup,
    SidebarCollapsedItem,
    useSidebar,
} from '@repo/navigation'

import { CUSTOMERS_DEFAULT_PATH } from 'routes/layout/products/customers'

export function CustomersSidebar() {
    const { isCollapsed } = useSidebar()

    if (isCollapsed) {
        return (
            <SidebarCollapsedGroup>
                <SidebarCollapsedItem
                    id="all-customers"
                    icon="notebook"
                    label="All customers"
                />
            </SidebarCollapsedGroup>
        )
    }

    return (
        <NavigationSection
            to={CUSTOMERS_DEFAULT_PATH}
            label="All customers"
            leadingSlot="notebook"
        />
    )
}
