import { NavigationSection, NavigationSectionGroup } from '@repo/navigation'

import { Box, Tag } from '@gorgias/axiom'

import type { ProductMetadata } from 'routes/layout/productMetadata'
import { Product, productMetadata } from 'routes/layout/productMetadata'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'

type ProductNavigationSectionProps = {
    product: ProductMetadata
    requiresUpgrade?: boolean
}

function ProductNavigationSection({
    product,
    requiresUpgrade,
}: ProductNavigationSectionProps) {
    return (
        <NavigationSection
            id={product.id}
            to={product.defaultPath}
            exact
            label={
                requiresUpgrade ? (
                    <Box alignItems="center" gap="xxs">
                        <div>{product.name}</div>
                        <Tag color="green" size="sm">
                            Upgrade
                        </Tag>
                    </Box>
                ) : (
                    product.name
                )
            }
            leadingSlot={product.icon}
        />
    )
}

export function HomeSidebar() {
    const {
        canAccessAiAgent,
        aiAgentRequiresUpgrade,
        isAiJourneyVisible,
        isConvertVisible,
    } = useNavigationProducts()

    return (
        <NavigationSectionGroup storageKey="home" defaultExpandedKeys={[]}>
            <ProductNavigationSection
                product={productMetadata[Product.Inbox]}
            />
            {canAccessAiAgent && (
                <ProductNavigationSection
                    product={productMetadata[Product.AiAgent]}
                    requiresUpgrade={aiAgentRequiresUpgrade}
                />
            )}
            {isAiJourneyVisible && (
                <ProductNavigationSection
                    product={productMetadata[Product.Marketing]}
                />
            )}
            {isConvertVisible && (
                <ProductNavigationSection
                    product={productMetadata[Product.Convert]}
                />
            )}
            <ProductNavigationSection
                product={productMetadata[Product.Analytics]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Workflows]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Customers]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Settings]}
            />
        </NavigationSectionGroup>
    )
}
