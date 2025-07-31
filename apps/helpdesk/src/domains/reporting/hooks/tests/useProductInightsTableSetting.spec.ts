import { renderHook } from '@repo/testing'

import { useProductInsightsTableSetting } from 'domains/reporting/hooks/useProductInsightsTableConfigSetting'
import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    columnsOrder,
    productInsightsTableActiveView,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { submitProductInsightsTableConfigView } from 'state/currentAccount/actions'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useTableConfigSetting')
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
