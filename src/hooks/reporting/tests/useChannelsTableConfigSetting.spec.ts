import { renderHook } from '@testing-library/react-hooks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useChannelsTableSetting } from 'hooks/reporting/useChannelsTableConfigSetting'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ChannelsTableColumns } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('core/flags')
const mockUseFlag = assumeMock(useFlag)

jest.mock('hooks/reporting/useTableConfigSetting')
const useTableConfigSettingMock = assumeMock(useTableConfigSetting)

describe('useChannelsTableConfigSetting.ts', () => {
    it('should call useTableConfigSetting with Channel specific props', () => {
        renderHook(() => useChannelsTableSetting())

        expect(useTableConfigSettingMock).toHaveBeenCalledWith(
            getChannelsTableConfigSettingsJS,
            channelsReportTableActiveView,
            columnsOrder,
            [],
            submitChannelsTableConfigView,
        )
    })

    it('should add MedianResponseTime column when the feature flag is on', () => {
        mockUseFlag.mockImplementation(
            (flag) => flag === FeatureFlagKey.ReportingAverageResponseTime,
        )
        renderHook(() => useChannelsTableSetting())

        expect(useTableConfigSettingMock).toHaveBeenCalledWith(
            getChannelsTableConfigSettingsJS,
            channelsReportTableActiveView,
            [...columnsOrder, ChannelsTableColumns.MedianResponseTime],
            [],
            submitChannelsTableConfigView,
        )
    })
})
