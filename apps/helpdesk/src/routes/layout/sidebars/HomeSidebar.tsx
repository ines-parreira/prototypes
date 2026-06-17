import {
    NavigationSection,
    NavigationSectionGroup,
    useSidebar,
} from '@repo/navigation'

import { useLocation } from 'react-router-dom'

import { Box, Icon, Tag } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { StoreSelector } from 'pages/common/components/StoreSelector/StoreSelector'
import type { ProductMetadata } from 'routes/layout/productMetadata'
import { Product, productMetadata } from 'routes/layout/productMetadata'
import { CollapsedHomeSidebar } from 'routes/layout/sidebars/CollapsedHomeSidebar'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './HomeSidebar.less'

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

const GAIA_NAV_ITEMS = [
    { id: 'digest', label: 'Daily digest', icon: 'menu-alt-2', active: true },
    { id: 'opportunities', label: 'Opportunities', icon: 'inbox', badge: '20' },
    { id: 'conversations', label: 'Conversations', icon: 'chat-circle' },
] as const

/**
 * Prototype-only sidebar for the Gaia homepage (`/app/gaia-home`). Kept
 * separate from the real Home product navigation so `/app/home` is unaffected.
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

            <div className={css.navList}>
                {GAIA_NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${css.navItem} ${
                            'active' in item && item.active
                                ? css.navItemActive
                                : ''
                        }`}
                    >
                        <Icon name={item.icon} size="sm" />
                        <span className={css.navLabel}>{item.label}</span>
                        {'badge' in item && item.badge && (
                            <span className={css.navBadge}>{item.badge}</span>
                        )}
                    </button>
                ))}
            </div>
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

    if (pathname.includes('/gaia-home')) {
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
