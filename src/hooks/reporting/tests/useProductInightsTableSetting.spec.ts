import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    columnsOrder,
    productInsightsTableActiveView,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableConfig'
import { submitProductInsightsTableConfigView } from 'state/currentAccount/actions'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useTableConfigSetting')
const useTableConfigSettingMock = assumeMock(useTableConfigSetting)

describe('useProductInsightsTableSetting.ts', () => {
    it('should call useProductInsightsTableSetting with Product and Insight specific props', () => {
        renderHook(() => useProductInsightsTableSetting())

        expect(useTableConfigSettingMock).toHaveBeenCalledWith(
            getProductInsightsTableConfigSettingsJS,
            productInsightsTableActiveView,
            columnsOrder,
            [],
            submitProductInsightsTableConfigView,
        )
    })
})
