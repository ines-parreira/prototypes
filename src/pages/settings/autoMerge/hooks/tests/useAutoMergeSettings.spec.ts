import {renderHook} from '@testing-library/react-hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'common/segment'
import {submitSetting} from 'state/currentAccount/actions'
import {AccountSettingType} from 'state/currentAccount/types'
import {defaultAutoMergeSettings} from 'pages/settings/autoMerge/constants'
import useAutoMergeSettings from 'pages/settings/autoMerge/hooks/useAutoMergeSettings'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('state/currentAccount/actions', () => ({
    submitSetting: jest.fn(() => 'submit-setting'),
}))
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AutoMergeSettingsUpdated: 'auto-merge-settings-updated',
    },
}))

const logEventMock = logEvent as jest.Mock
const submitSettingMock = submitSetting as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useAutoMergeSettings', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()

        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue({
            id: 4,
            type: AccountSettingType.AutoMerge,
            data: {tickets: defaultAutoMergeSettings},
        })
    })

    it('should return default state', () => {
        const {result} = renderHook(() => useAutoMergeSettings())

        expect(result.current).toEqual({
            initialAutoMergeSettings: {
                enabled: false,
                merging_window_days: 5,
            },
            saveAutoMergeSettings: expect.any(Function),
        })
    })

    it('should dispatch an action and log an event when saving', async () => {
        const {result} = renderHook(() => useAutoMergeSettings())

        await result.current.saveAutoMergeSettings({
            enabled: true,
            merging_window_days: 19,
        })

        const payload = {
            id: 4,
            type: AccountSettingType.AutoMerge,
            data: {
                tickets: {
                    enabled: true,
                    merging_window_days: 19,
                },
            },
        }

        expect(submitSettingMock).toHaveBeenCalledWith(payload)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutoMergeSettingsUpdated,
            payload
        )
    })
})
