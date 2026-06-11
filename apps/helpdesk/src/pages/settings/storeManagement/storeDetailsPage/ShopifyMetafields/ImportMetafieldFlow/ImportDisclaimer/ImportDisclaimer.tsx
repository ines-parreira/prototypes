import { LegacyBanner as Banner } from '@gorgias/axiom'

export function ImportDisclaimer() {
    return (
        <Banner type="info">
            Shopify metafields apply only to new or updated customers and
            orders. Anything created before the import won’t be updated
            retroactively.
        </Banner>
    )
}
