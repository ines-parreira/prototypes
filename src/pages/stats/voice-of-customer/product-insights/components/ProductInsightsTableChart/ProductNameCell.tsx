import { SegmentEvent } from 'common/segment'
import { ProductImage } from 'pages/stats/voice-of-customer/product-insights/components/ProductImage'
import { CellWrapper } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/CellWrapper'
import css from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent.less'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/types'
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger'
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
                            SegmentEvent.StatVoCSidePanelIntentClick
                        }
                    >
                        {product.name}
                    </VoCSidePanelTrigger>
                </div>
            </div>
        </CellWrapper>
    )
}
