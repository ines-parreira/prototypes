import {
    NavigationSection,
    SidebarCollapsedItem,
    useSidebar,
} from '@repo/navigation'

import { ButtonGroup } from '@gorgias/axiom'

import { CUSTOMERS_DEFAULT_PATH } from 'routes/layout/products/customers'

export function CustomersSidebar() {
    const { isCollapsed } = useSidebar()

    if (isCollapsed) {
        return (
            <ButtonGroup withoutBorder>
                <SidebarCollapsedItem
                    id="all-customers"
                    icon="notebook"
                    label="All customers"
                />
            </ButtonGroup>
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
