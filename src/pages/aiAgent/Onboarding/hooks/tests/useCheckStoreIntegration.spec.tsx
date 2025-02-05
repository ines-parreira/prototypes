import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock

const mockGoToStep = jest.fn()

describe('useCheckStoreIntegration', () => {
    it('should not call goToStep when isLoading is true', () => {
        mockUseAppSelector.mockReturnValue(
            fromJS({id: '123', name: 'Valid Store'})
        )

        const {result} = renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'test-store',
                isLoading: true,
                goToStep: mockGoToStep,
            })
        )

        expect(mockGoToStep).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not call goToStep when storeIntegration is valid', () => {
        mockUseAppSelector.mockReturnValue(
            fromJS({id: '123', name: 'Valid Store'})
        )

        const {result} = renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'valid-store',
                isLoading: false,
                goToStep: mockGoToStep,
            })
        )

        expect(mockGoToStep).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should call goToStep(WizardStepEnum.SHOPIFY_INTEGRATION) when storeIntegration is empty', () => {
        mockUseAppSelector.mockReturnValue(fromJS({}))

        renderHook(() =>
            useCheckStoreIntegration({
                storeName: 'empty-store',
                isLoading: false,
                goToStep: mockGoToStep,
            })
        )

        expect(mockGoToStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION
        )
    })
})
