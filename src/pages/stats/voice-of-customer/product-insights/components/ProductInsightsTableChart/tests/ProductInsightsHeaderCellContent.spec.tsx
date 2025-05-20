import { render } from '@testing-library/react'

import { ProductInsightsHeaderCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsHeaderCellContent'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

describe('ProductInsightsHeaderCellContent', () => {
    it('renders without crashing', () => {
        render(
            <ProductInsightsHeaderCellContent
                column={ProductInsightsTableColumns.Product}
            />,
        )
    })
})
