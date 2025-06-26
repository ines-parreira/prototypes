import { render } from '@testing-library/react'

import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import { EditTableColumns } from 'pages/stats/common/components/Table/EditTableColumns'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsEditColumns'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
    ProductInsightsTableViews,
} from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/Table/EditTableColumns')
const EditTableColumnsMock = assumeMock(EditTableColumns)

describe('ProductInsightsEditColumns', () => {
    beforeEach(() => {
        EditTableColumnsMock.mockImplementation(() => <div />)
    })

    it('should call the EditTableColumns with Product Insights specific props', () => {
        render(<ProductInsightsEditColumns />)

        expect(EditTableColumnsMock).toHaveBeenCalledWith(
            {
                settingsSelector: getProductInsightsTableConfigSettingsJS,
                fallbackViews: ProductInsightsTableViews,
                tableLabels: ProductInsightsTableLabels,
                tooltips: ProductInsightsColumnConfig,
                leadColumn: LeadColumn,
                useTableSetting: useProductInsightsTableSetting,
            },
            {},
        )
    })
})
