import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    columnsOrder,
    productInsightsTableActiveView,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import type { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { submitProductInsightsTableConfigView } from 'state/currentAccount/actions'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const useProductInsightsTableSetting = () => {
    return useTableConfigSetting<ProductInsightsTableColumns, never>(
        getProductInsightsTableConfigSettingsJS,
        productInsightsTableActiveView,
        columnsOrder,
        [],
        submitProductInsightsTableConfigView,
    )
}
