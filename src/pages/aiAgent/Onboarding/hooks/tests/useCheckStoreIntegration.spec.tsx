import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock

describe('useCheckStoreIntegration', () => {
    let mockSetCurrentStep: jest.Mock

    beforeEach(() => {
        mockSetCurrentStep = jest.fn()
    })

    it('should not call setCurrentStep when isLoading is true', () => {
        mockUseAppSelector.mockReturnValue(
            fromJS({id: '123', name: 'Valid Store'})
        )

        const {result} = renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'test-store',
                isLoading: true,
                setCurrentStep: mockSetCurrentStep,
            })
        )

        expect(mockSetCurrentStep).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not call setCurrentStep when storeIntegration is valid', () => {
        mockUseAppSelector.mockReturnValue(
            fromJS({id: '123', name: 'Valid Store'})
        )

        const {result} = renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'valid-store',
                isLoading: false,
                setCurrentStep: mockSetCurrentStep,
            })
        )

        expect(mockSetCurrentStep).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should call setCurrentStep(WizardStepEnum.SHOPIFY_INTEGRATION) when storeIntegration is empty', () => {
        mockUseAppSelector.mockReturnValue(fromJS({}))

        renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'empty-store',
                isLoading: false,
                setCurrentStep: mockSetCurrentStep,
            })
        )

        expect(mockSetCurrentStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION
        )
    })

    it('should handle missing setCurrentStep gracefully (no error)', () => {
        mockUseAppSelector.mockReturnValue(fromJS({}))

        expect(() => {
            renderHook(() =>
                useCheckStoreIntegration({
                    storeName: 'empty-store',
                    isLoading: false,
                    setCurrentStep: undefined,
                })
            )
        }).not.toThrow()
    })
})
