import {renderHook} from '@testing-library/react-hooks'
import useAppSelector from 'hooks/useAppSelector'
import {HelpCenterAutomateType} from 'models/helpCenter/types'
import {useShopifyStoreWithChatConnectionsOptions} from 'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
import useGetAutomateType from '../useGetAutomateType'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock(
    'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions',
    () => ({
        useShopifyStoreWithChatConnectionsOptions: jest.fn(),
    })
)
const useShopifyStoreWithChatConnectionsOptionsMock =
    useShopifyStoreWithChatConnectionsOptions as jest.Mock

describe('useGetAutomateType', () => {
    it('returns NON_AUTOMATE when hasAutomate is false', () => {
        useAppSelectorMock.mockReturnValueOnce(false)
        useShopifyStoreWithChatConnectionsOptionsMock.mockReturnValueOnce([])

        const {result} = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.NON_AUTOMATE)
    })

    it('returns NON_AUTOMATE when hasAutomate is undefined', () => {
        useAppSelectorMock.mockReturnValueOnce(undefined)
        useShopifyStoreWithChatConnectionsOptionsMock.mockReturnValueOnce([])

        const {result} = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.NON_AUTOMATE)
    })

    it('returns AUTOMATE_NO_STORE when hasAutomate is true and shopifyShopsOptions is empty', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        useShopifyStoreWithChatConnectionsOptionsMock.mockReturnValueOnce([])

        const {result} = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE_NO_STORE when hasAutomate is true and shopifyShopsOptions is undefined', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        useShopifyStoreWithChatConnectionsOptionsMock.mockReturnValueOnce(
            undefined
        )

        const {result} = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE_NO_STORE)
    })

    it('returns AUTOMATE when hasAutomate is true and shopifyShopsOptions is not empty', () => {
        useAppSelectorMock.mockReturnValueOnce(true)
        useShopifyStoreWithChatConnectionsOptionsMock.mockReturnValueOnce([
            {option: 'test', icon: 'test', connectedChatsCount: 'test'},
        ])

        const {result} = renderHook(() => useGetAutomateType())

        expect(result.current).toEqual(HelpCenterAutomateType.AUTOMATE)
    })
})
