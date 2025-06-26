import { SegmentEvent } from 'common/segment'
import { ProductImage } from 'pages/stats/voice-of-customer/components/ProductImage'
import { CellWrapper } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import css from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsCellContent.less'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/types'
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

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
