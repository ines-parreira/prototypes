import { renderHook } from '@repo/testing'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { HelpCenterAutomateType } from 'models/helpCenter/types'

import useGetAutomateType from '../useGetAutomateType'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('hooks/useAppSelector')

const useAiAgentAccessMock = useAiAgentAccess as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useGetAutomateType', () => {
    it('returns NON_AUTOMATE when hasAccess is false', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        useAppSelectorMock.mockReturnValue([])

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.NON_AUTOMATE)
    })

    it('returns AUTOMATE_NO_STORE when hasAccess is true and store integrations is empty', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useAppSelectorMock.mockReturnValue([])

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE_NO_STORE when hasAccess is true and store integrations is undefined', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useAppSelectorMock.mockReturnValue(undefined)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE when hasAccess is true and store integrations exist', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        const storeMock = [{ id: 1, type: 'shopify' }]
        useAppSelectorMock.mockReturnValue(storeMock)

        const { result } = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE)
    })
})
