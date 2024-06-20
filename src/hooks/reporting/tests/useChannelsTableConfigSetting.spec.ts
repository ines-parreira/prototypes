import {renderHook} from '@testing-library/react-hooks'
import {useChannelsTableSetting} from 'hooks/reporting/useChannelsTableConfigSetting'
import {useTableConfigSetting} from 'hooks/reporting/useTableConfigSetting'
import {columnsOrder} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {submitChannelsTableConfigView} from 'state/currentAccount/actions'
import {getChannelsTableActiveView} from 'state/currentAccount/selectors'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useTableConfigSetting')
const useTableConfigSettingMock = assumeMock(useTableConfigSetting)

describe('useChannelsTableConfigSetting.ts', () => {
    it('should call useTableConfigSetting with Channel specific props', () => {
        renderHook(() => useChannelsTableSetting())

        expect(useTableConfigSettingMock).toHaveBeenCalledWith(
            getChannelsTableActiveView,
            columnsOrder,
            submitChannelsTableConfigView
        )
    })
})
