import { SidebarCollapsedGroup, SidebarCollapsedItem } from '@repo/navigation'
import { history } from '@repo/routing'

import { Product, productMetadata } from 'routes/layout/productMetadata'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'

export function CollapsedHomeSidebar() {
    const { canAccessAiAgent, isAiJourneyVisible, isConvertVisible } =
        useNavigationProducts()

    const handleSelectionChange = (id: string) => {
        const product = Object.values(productMetadata).find((p) => p.id === id)
        if (!product) return
        history.push(product.defaultPath)
    }

    const visibleProducts = [
        productMetadata[Product.Inbox],
        ...(canAccessAiAgent ? [productMetadata[Product.AiAgent]] : []),
        ...(isAiJourneyVisible ? [productMetadata[Product.Marketing]] : []),
        ...(isConvertVisible ? [productMetadata[Product.Convert]] : []),
        productMetadata[Product.Analytics],
        productMetadata[Product.Workflows],
        productMetadata[Product.Customers],
        productMetadata[Product.Settings],
    ]

    return (
        <SidebarCollapsedGroup onSelectionChange={handleSelectionChange}>
            {visibleProducts.map((product) => (
                <SidebarCollapsedItem
                    key={product.id}
                    id={product.id}
                    icon={product.icon}
                    label={product.name}
                />
            ))}
        </SidebarCollapsedGroup>
    )
}
