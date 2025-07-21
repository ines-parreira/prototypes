import { useProductInsightsTableSetting } from 'domains/reporting/hooks/useProductInsightsTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
    ProductInsightsTableViews,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const ProductInsightsEditColumns = () => {
    return (
        <EditTableColumns<ProductInsightsTableColumns, never>
            settingsSelector={getProductInsightsTableConfigSettingsJS}
            fallbackViews={ProductInsightsTableViews}
            tableLabels={ProductInsightsTableLabels}
            tooltips={ProductInsightsColumnConfig}
            leadColumn={LeadColumn}
            leadRow={undefined}
            useTableSetting={useProductInsightsTableSetting}
        />
    )
}
