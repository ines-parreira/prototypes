import { assumeMock, renderHook } from '@repo/testing'

import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
    columnsOrderWithoutHrtAi,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'

jest.mock('domains/reporting/hooks/useTableConfigSetting')
const useTableConfigSettingMock = assumeMock(useTableConfigSetting)

jest.mock('domains/reporting/hooks/useIsHrtAiEnabled')
const useIsHrtAiEnabledMock = assumeMock(useIsHrtAiEnabled)

describe('useChannelsTableConfigSetting.ts', () => {
    beforeEach(() => {
        useIsHrtAiEnabledMock.mockReturnValue(true)
    })

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

    it('should call useTableConfigSetting with Channel specific props when HRT-AI is disabled', () => {
        useIsHrtAiEnabledMock.mockReturnValue(false)

        renderHook(() => useChannelsTableSetting())

        expect(useTableConfigSettingMock).toHaveBeenCalledWith(
            getChannelsTableConfigSettingsJS,
            channelsReportTableActiveView,
            columnsOrderWithoutHrtAi,
            [],
            submitChannelsTableConfigView,
        )
    })
})
