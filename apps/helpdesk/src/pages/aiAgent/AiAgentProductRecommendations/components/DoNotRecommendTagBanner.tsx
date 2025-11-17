import { LegacyBanner as Banner } from '@gorgias/axiom'

import { AlertType } from 'pages/common/components/Alert/Alert'

export const DoNotRecommendTagBanner = () => {
    return (
        <Banner type={AlertType.Info} icon fillStyle="fill">
            Add the tag{' '}
            <span style={{ fontWeight: '600' }}>gorgias_do_not_recommend</span>{' '}
            to products in Shopify to ensure AI Agent never references them or
            answers questions about them. Unlike exclusions set in Gorgias,
            products with this tag are fully ignored and won’t be mentioned in
            any context.
        </Banner>
    )
}
