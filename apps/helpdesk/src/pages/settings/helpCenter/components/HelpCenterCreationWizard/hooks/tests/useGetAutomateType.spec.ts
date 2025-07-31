import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { HelpCenterAutomateType } from 'models/helpCenter/types'

import useGetAutomateType from '../useGetAutomateType'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useGetAutomateType', () => {
    it('returns NON_AUTOMATE when hasAutomate is false', () => {
        useAppSelectorMock.mockReturnValueOnce(false)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.NON_AUTOMATE)
    })

    it('returns NON_AUTOMATE when hasAutomate is undefined', () => {
        useAppSelectorMock.mockReturnValueOnce(undefined)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.NON_AUTOMATE)
    })

    it('returns AUTOMATE_NO_STORE when hasAutomate is true and shopifyShopsOptions is empty', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        useAppSelectorMock.mockReturnValueOnce([])

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE_NO_STORE when hasAutomate is true and shopifyShopsOptions is undefined', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        useAppSelectorMock.mockReturnValueOnce(undefined)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE when hasAutomate is true and shopifyShopsOptions is not empty', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        const storeMock = [
            { option: 'test', icon: 'test', connectedChatsCount: 'test' },
        ]
        useAppSelectorMock.mockReturnValueOnce(storeMock)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE)
    })
})
