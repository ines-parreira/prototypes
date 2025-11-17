import { SegmentEvent } from '@repo/logging'

import { ProductImage } from 'domains/reporting/pages/voice-of-customer/components/ProductImage'
import { CellWrapper } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import css from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsCellContent.less'
import type { PropsWithProduct } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/types'
import { VoCSidePanelTrigger } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'

export const ProductNameCell = ({ product }: PropsWithProduct) => {
    return (
        <CellWrapper column={ProductInsightsTableColumns.Product}>
            <div className={css.product}>
                <ProductImage src={product.thumbnail_url} alt={product.name} />
                <div className={css.productName}>
                    <VoCSidePanelTrigger
                        highlighted
                        product={product}
                        segmentEventName={
                            SegmentEvent.StatVoCSidePanelProductClick
                        }
                    >
                        {product.name}
                    </VoCSidePanelTrigger>
                </div>
            </div>
        </CellWrapper>
    )
}
