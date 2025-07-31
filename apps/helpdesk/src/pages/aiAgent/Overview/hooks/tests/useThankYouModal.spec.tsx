import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { assumeMock } from 'utils/testing'

import { useThankYouModal } from '../useThankYouModal'

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
}))

jest.mock('hooks/useAppSelector')

const mockUseLocation = useLocation as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreActivationsMock = assumeMock(useStoreActivations)

describe('useThankYouModal', () => {
    const canActivateMock = jest.fn()
    const activateMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        canActivateMock.mockReturnValue({ isDisabled: false, isLoading: false })
        useStoreActivationsMock.mockReturnValue({
            activation: () => ({
                canActivate: canActivateMock,
                activate: activateMock,
                isActivating: false,
            }),
        } as any)
    })

    it('should set isOpen to true when from=onboarding', () => {
        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        const { result } = renderHook(() => useThankYouModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('should set isOpen to false when from is not onboarding', () => {
        mockUseLocation.mockReturnValue({
            search: '?shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')

        const { result } = renderHook(() => useThankYouModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('should call activate when handleModalAction("confirm") is triggered and isDisabled is false', () => {
        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')
        canActivateMock.mockReturnValue({ isDisabled: false, isLoading: false })

        const { result } = renderHook(() => useThankYouModal())

        result.current.handleModalAction('confirm')

        expect(activateMock).toHaveBeenCalledTimes(1)
    })

    it('should call clearFromQueryParam when handleModalAction("close") is triggered', async () => {
        const mockReplaceState = jest.fn()
        global.window.history.replaceState = mockReplaceState

        mockUseLocation.mockReturnValue({
            search: '?from=onboarding&shopName=test-shop',
            pathname: '/test-path',
        })
        mockUseAppSelector.mockReturnValue('test-account')

        const { result } = renderHook(() => useThankYouModal())

        await result.current.handleModalAction('close')

        await waitFor(() => {
            expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/test-path')
            expect(result.current.isOpen).toBe(false)
        })
    })

    it('should not call open the ThankYouModal when shopName if missing', () => {
        mockUseLocation.mockReturnValue({
            search: '?from=onboarding',
            pathname: '/test-path',
        })

        const { result } = renderHook(() => useThankYouModal())

        expect(result.current.isOpen).toBe(false)
    })
})
