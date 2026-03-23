import { useMemo } from 'react'

import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
import { MetafieldValue } from '@repo/ecommerce/shopify/components'

import { Box, Text } from '@gorgias/axiom'

import { useMetafieldsFilter } from '../../hooks/useMetafieldsFilter'

import css from './orders/sidePanel/OrderSidePanelPreview.less'

type Props = {
    integrationId?: number
    metafields?: FullShopifyMetafield[]
    storeName?: string
}

export function MetafieldsSection({
    integrationId,
    metafields: metafieldsProp,
    storeName,
}: Props) {
    const { filterMetafields } = useMetafieldsFilter(integrationId)

    const visibleMetafields = useMemo(() => {
        if (!metafieldsProp || metafieldsProp.length === 0) return []
        return filterMetafields(metafieldsProp)
    }, [metafieldsProp, filterMetafields])

    if (visibleMetafields.length === 0) return null

    return (
        <>
            {visibleMetafields.map((metafield) => (
                <Box
                    key={`${metafield.namespace ?? ''}.${metafield.key}`}
                    display="grid"
                    w="100%"
                    alignItems="flex-start"
                    gap="xs"
                    className={css.row}
                >
                    <Text as="span" size="md" className={css.label}>
                        {metafield.name ??
                            (metafield.namespace
                                ? `${metafield.namespace}.${metafield.key}`
                                : metafield.key)}
                    </Text>
                    <Box minWidth={0} className={css.metafieldValue}>
                        <MetafieldValue
                            metafield={metafield}
                            storeName={storeName}
                        />
                    </Box>
                </Box>
            ))}
        </>
    )
}
