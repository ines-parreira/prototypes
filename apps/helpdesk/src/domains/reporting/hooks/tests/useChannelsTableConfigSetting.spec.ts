import { renderHook } from '@repo/testing'

import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useTableConfigSetting')
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
})
