import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    columnsOrder,
    productInsightsTableActiveView,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { submitProductInsightsTableConfigView } from 'state/currentAccount/actions'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const useProductInsightsTableSetting = () => {
    return useTableConfigSetting<ProductInsightsTableColumns, never>(
        getProductInsightsTableConfigSettingsJS,
        productInsightsTableActiveView,
        columnsOrder,
        [],
        submitProductInsightsTableConfigView,
    )
}
