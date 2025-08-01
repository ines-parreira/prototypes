import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useProductInsightsTableSetting } from 'domains/reporting/hooks/useProductInsightsTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import { ProductInsightsEditColumns } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsEditColumns'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
    ProductInsightsTableViews,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'

jest.mock('domains/reporting/pages/common/components/Table/EditTableColumns')
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
