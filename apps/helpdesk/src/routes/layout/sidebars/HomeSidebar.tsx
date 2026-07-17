import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { useLocation } from 'react-router-dom'

import { Box, Quantity, Tag } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { StoreSelector } from 'pages/common/components/StoreSelector/StoreSelector'
import type { ProductMetadata } from 'routes/layout/productMetadata'
import { Product, productMetadata } from 'routes/layout/productMetadata'
import { CollapsedHomeSidebar } from 'routes/layout/sidebars/CollapsedHomeSidebar'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

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

/**
 * Prototype-only sidebar for the Gaia pages (`/app/gaia-*`). Kept separate
 * from the real Home product navigation so `/app/home` is unaffected. Uses the
 * standard NavigationSection so only the active route is highlighted.
 */
function GaiaHomePrototypeSidebar() {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    return (
        <Box flexDirection="column" height="100%" gap="sm">
            {storeIntegrations.length > 0 && (
                <StoreSelector
                    integrations={storeIntegrations}
                    selected={storeIntegrations[0]}
                    onChange={() => {}}
                    fullWidth
                />
            )}

            <NavigationSectionGroup
                storageKey="gaia-home"
                defaultExpandedKeys={[]}
            >
                <NavigationSectionItem
                    id="gaia-digest"
                    to="/app/gaia-home"
                    exact
                    label="Daily digest"
                    leadingSlot="menu-alt-2"
                />
                <NavigationSectionItem
                    id="gaia-opportunities"
                    to="/app/gaia-opportunities"
                    exact
                    leadingSlot="inbox"
                    label="Opportunities"
                    trailingSlot={({ isActive }) => (
                        <Quantity
                            quantity={20}
                            color={isActive ? 'purple' : undefined}
                        />
                    )}
                />
                <NavigationSectionItem
                    id="gaia-conversations"
                    to="/app/gaia-conversations"
                    exact
                    label="Gaia conversations"
                    leadingSlot="chat-circle"
                />
            </NavigationSectionGroup>
        </Box>
    )
}

export function HomeSidebar() {
    const { isCollapsed } = useSidebar()
    const { pathname } = useLocation()
    const {
        canAccessAiAgent,
        aiAgentRequiresUpgrade,
        isAiJourneyVisible,
        isConvertVisible,
    } = useNavigationProducts()

    if (isCollapsed) {
        return <CollapsedHomeSidebar />
    }

    if (pathname.includes('/gaia-')) {
        return <GaiaHomePrototypeSidebar />
    }

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
