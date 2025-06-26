import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import { EditTableColumns } from 'pages/stats/common/components/Table/EditTableColumns'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
    ProductInsightsTableViews,
} from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

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
