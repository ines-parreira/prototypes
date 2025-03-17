import { act, renderHook } from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'

import { HandoverCustomizationOfflineSettingsFormValues } from '../../types'
import {
    getInitialFormValues,
    mapFormValuesToHandoverConfigurationData,
} from '../../utils/handoverCustomizationOfflineSettingsForm.utils'
import { useAiAgentHandoverConfigurationMutation } from '../useAiAgentHandoverConfigurationMutation'
import { useFetchAiAgentStoreHandoverConfiguration } from '../useFetchAiAgentHandoverConfiguration'
import { useHandoverCustomizationOfflineSettingsForm } from '../useHandoverCustomizationOfflineSettingsForm'

// Mock dependencies
jest.mock('hooks/useAppSelector')
jest.mock('hooks/useNotify')

jest.mock('../useFetchAiAgentHandoverConfiguration', () => ({
    useFetchAiAgentStoreHandoverConfiguration: jest.fn(),
}))

jest.mock('../useAiAgentHandoverConfigurationMutation', () => ({
    useAiAgentHandoverConfigurationMutation: jest.fn(),
}))

jest.mock('../../utils/handoverCustomizationOfflineSettingsForm.utils', () => ({
    formFieldsConfiguration: {
        offlineInstructions: {
            friendlyName: 'Offline instructions',
            required: false,
            maxLength: 30,
        },
        shareBusinessHours: {
            friendlyName: 'Share business hours',
            required: false,
        },
    },
    getInitialFormValues: jest.fn(),
    mapFormValuesToHandoverConfigurationData: jest.fn(),
}))

describe('useHandoverCustomizationOfflineSettingsForm', () => {
    // Mock data
    const mockIntegration: GorgiasChatIntegration = {
        id: 456,
        type: IntegrationType.GorgiasChat,
        meta: {
            shop_name: 'Test Shop',
            shop_type: 'Test Type',
        },
    } as GorgiasChatIntegration

    const mockInitialFormValues: HandoverCustomizationOfflineSettingsFormValues =
        {
            offlineInstructions: '',
            shareBusinessHours: false,
        }

    const mockHandoverConfiguration = {
        offlineInstructions: 'Test offline instructions',
        shareBusinessHours: true,
    }

    // Mock functions
    const mockNotifySuccess = jest.fn()
    const mockNotifyError = jest.fn()
    const mockRefetch = jest.fn().mockResolvedValue({})
    const mockUpsertHandoverConfiguration = jest.fn()
    const mockUseAppSelector = useAppSelector as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        // Setup mocks
        mockUseAppSelector.mockReturnValue({
            get: (key: string) => {
                if (key === 'domain') return 'test-domain'
                if (key === 'id') return 123
                return null
            },
        })
        ;(useNotify as jest.Mock).mockReturnValue({
            success: mockNotifySuccess,
            error: mockNotifyError,
        })
        ;(getInitialFormValues as jest.Mock).mockReturnValue(
            mockInitialFormValues,
        )
        ;(
            useFetchAiAgentStoreHandoverConfiguration as jest.Mock
        ).mockReturnValue({
            data: null,
            isLoading: false,
            refetch: mockRefetch,
        })
        ;(useAiAgentHandoverConfigurationMutation as jest.Mock).mockReturnValue(
            {
                upsertHandoverConfiguration: mockUpsertHandoverConfiguration,
            },
        )
        ;(
            mapFormValuesToHandoverConfigurationData as jest.Mock
        ).mockReturnValue({
            accountId: 123,
            storeName: 'Test Shop',
            shopType: 'Test Type',
            integrationId: 456,
            offlineInstructions: 'Updated instructions',
            shareBusinessHours: true,
        })
    })

    it('should initialize with default form values', () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        expect(result.current.formValues).toEqual(mockInitialFormValues)
        expect(result.current.hasChanges).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSaving).toBe(false)
        expect(result.current.hasError).toBe(false)
    })

    it('should initialize with configuration values loaded from the handover configuration fetch api hook', () => {
        ;(
            useFetchAiAgentStoreHandoverConfiguration as jest.Mock
        ).mockReturnValue({
            isLoading: true,
            refetch: mockRefetch,
        })

        const { result, rerender } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        expect(result.current.isLoading).toBe(true)
        ;(
            useFetchAiAgentStoreHandoverConfiguration as jest.Mock
        ).mockReturnValue({
            data: mockHandoverConfiguration,
            isLoading: false,
            refetch: mockRefetch,
        })

        rerender()

        expect(result.current.formValues).toEqual(mockHandoverConfiguration)
        expect(result.current.isLoading).toBe(false)
    })

    it('should update form values when updateValue is called', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'New instructions',
            )
        })

        expect(result.current.formValues.offlineInstructions).toBe(
            'New instructions',
        )
        expect(result.current.hasChanges).toBe(true)
        expect(result.current.hasError).toBe(false)
    })

    it('should reset form values when cancel is called', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'New instructions',
            )
        })

        expect(result.current.formValues.offlineInstructions).toBe(
            'New instructions',
        )
        expect(result.current.hasChanges).toBe(true)

        await act(async () => {
            result.current.handleOnCancel()
        })

        expect(result.current.formValues).toEqual(mockInitialFormValues)
        expect(result.current.hasChanges).toBe(false)
    })

    it('should not trigger upsertHandoverConfiguration mutation if there are no changes when handleOnSave is called', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).not.toHaveBeenCalled()
    })

    it('should save form values successfully when handleOnSave is called', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        result.current.updateValue(
            'offlineInstructions',
            'Updated instructions',
        )
        result.current.updateValue('shareBusinessHours', true)

        // Save the form
        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                offlineInstructions: 'Updated instructions',
                shareBusinessHours: true,
            }),
        )
        expect(mockNotifySuccess).toHaveBeenCalledWith(
            'Changes saved successfully!',
        )
        expect(result.current.isSaving).toBe(false)
    })

    it('should handle errors when saving fails', async () => {
        const mockError = new Error('Save failed')
        mockUpsertHandoverConfiguration.mockRejectedValueOnce(mockError)

        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'Updated instructions',
            )
        })

        // Try to save
        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).toHaveBeenCalled()
        expect(mockNotifyError).toHaveBeenCalledWith('Save failed')
        expect(result.current.isSaving).toBe(false)
    })

    it('should handle errors when saving fails', async () => {
        const mockError = new Error('Save failed')
        mockUpsertHandoverConfiguration.mockRejectedValueOnce(mockError)

        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'Updated instructions',
            )
        })

        // Try to save
        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).toHaveBeenCalled()
        expect(mockNotifyError).toHaveBeenCalledWith('Save failed')
        expect(result.current.isSaving).toBe(false)
    })

    it('should handle error with unknown error when saving fails with no error thrown', async () => {
        const mockError = 'whatever not an error'
        mockUpsertHandoverConfiguration.mockRejectedValueOnce(mockError)

        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'Updated instructions',
            )
        })

        // Try to save
        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).toHaveBeenCalled()
        expect(mockNotifyError).toHaveBeenCalledWith(
            'An unknown error occurred. Please try again',
        )
        expect(result.current.isSaving).toBe(false)
    })

    it('should not save form values if the offline instructions are longer than 30 characters', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'Modified offline instructions with more than 30 characters',
            )
        })

        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).not.toHaveBeenCalled()
        expect(mockNotifyError).toHaveBeenCalledWith(
            'Please check the form for errors',
        )
        expect(result.current.hasError).toBe(true)
        expect(result.current.isSaving).toBe(false)
    })
})
