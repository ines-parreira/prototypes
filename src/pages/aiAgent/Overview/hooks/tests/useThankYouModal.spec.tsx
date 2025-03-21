import { renderHook } from '@testing-library/react-hooks'
import { useLocation } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useIsGoLiveDisabled } from 'pages/aiAgent/Overview/hooks/useIsGoLiveDisabled'
import { useUpdateAIAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/useUpdateAiAgentStoreConfigurationData'

import { useThankYouModal } from '../useThankYouModal'

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Overview/hooks/useIsGoLiveDisabled')
jest.mock('pages/aiAgent/Overview/hooks/useUpdateAiAgentStoreConfigurationData')

const mockUseLocation = useLocation as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseIsGoLiveDisabled = useIsGoLiveDisabled as jest.Mock
const mockUseUpdateAIAgentStoreConfigurationData =
    useUpdateAIAgentStoreConfigurationData as jest.Mock

describe('useThankYouModal', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it('should set isOpen to true when from=onboarding', () => {
        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        mockUseIsGoLiveDisabled.mockReturnValue({
            isLoading: false,
            isDisabled: false,
        })
        mockUseUpdateAIAgentStoreConfigurationData.mockReturnValue({
            storeConfig: {},
            updateStoreConfig: jest.fn(),
            isUpdating: false,
        })

        const { result } = renderHook(() => useThankYouModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('should set isOpen to false when from is not onboarding', () => {
        mockUseLocation.mockReturnValue({
            search: '?shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        mockUseIsGoLiveDisabled.mockReturnValue({
            isLoading: false,
            isDisabled: false,
        })
        mockUseUpdateAIAgentStoreConfigurationData.mockReturnValue({
            storeConfig: {},
            updateStoreConfig: jest.fn(),
            isUpdating: false,
        })

        const { result } = renderHook(() => useThankYouModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('should call updateStoreConfig when handleModalAction("confirm") is triggered and isDisabled is false', () => {
        const mockUpdateStoreConfig = jest.fn()

        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        mockUseIsGoLiveDisabled.mockReturnValue({
            isLoading: false,
            isDisabled: false,
        })
        mockUseUpdateAIAgentStoreConfigurationData.mockReturnValue({
            storeConfig: {},
            updateStoreConfig: mockUpdateStoreConfig,
            isUpdating: false,
        })

        const { result } = renderHook(() => useThankYouModal())

        result.current.handleModalAction('confirm')

        expect(mockUpdateStoreConfig).toHaveBeenCalledTimes(1)
    })

    it('should call clearFromQueryParam when handleModalAction("close") is triggered', () => {
        const mockReplaceState = jest.fn()
        global.window.history.replaceState = mockReplaceState

        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        mockUseIsGoLiveDisabled.mockReturnValue({
            isLoading: false,
            isDisabled: false,
        })
        mockUseUpdateAIAgentStoreConfigurationData.mockReturnValue({
            storeConfig: {},
            updateStoreConfig: jest.fn(),
            isUpdating: false,
        })

        const { result } = renderHook(() => useThankYouModal())

        result.current.handleModalAction('close')

        expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/test-path')
        expect(result.current.isOpen).toBe(false)
    })
})
