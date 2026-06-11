import { renderHook } from '@repo/testing'
import { act, screen } from '@testing-library/react'

import { useAppSelector } from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { initialFormFieldValues } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils'
import { mapFormValuesToHandoverConfigurationData } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationConfigurationData.utils'

import { useAiAgentHandoverConfigurationMutation } from '../useAiAgentHandoverConfigurationMutation'
import { useFetchAiAgentStoreHandoverConfiguration } from '../useFetchAiAgentHandoverConfiguration'
import { useHandoverCustomizationChatOfflineSettingsForm } from '../useHandoverCustomizationChatOfflineSettingsForm'

// Mock dependencies
jest.mock('hooks/useAppSelector')

jest.mock('../useFetchAiAgentHandoverConfiguration', () => ({
    useFetchAiAgentStoreHandoverConfiguration: jest.fn(),
}))

jest.mock('../useAiAgentHandoverConfigurationMutation', () => ({
    useAiAgentHandoverConfigurationMutation: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils',
    () => ({
        ...jest.requireActual(
            'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils',
        ),
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
    }),
)

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationConfigurationData.utils',
    () => ({
        mapFormValuesToHandoverConfigurationData: jest.fn(),
    }),
)

describe('useHandoverCustomizationChatOfflineSettingsForm', () => {
    // Mock data
    const mockIntegration: GorgiasChatIntegration = {
        id: 456,
        type: IntegrationType.GorgiasChat,
        meta: {
            shop_name: 'Test Shop',
            shop_type: 'Test Type',
        },
    } as GorgiasChatIntegration

    const mockHandoverConfiguration = {
        offlineInstructions: 'Test offline instructions',
        shareBusinessHours: true,
    }

    // Mock functions
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
            useHandoverCustomizationChatOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        expect(result.current.formValues).toEqual(initialFormFieldValues)
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
            useHandoverCustomizationChatOfflineSettingsForm({
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
            useHandoverCustomizationChatOfflineSettingsForm({
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
            useHandoverCustomizationChatOfflineSettingsForm({
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

        expect(result.current.formValues).toEqual(initialFormFieldValues)
        expect(result.current.hasChanges).toBe(false)
    })

    it('should not trigger upsertHandoverConfiguration mutation if there are no changes when handleOnSave is called', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatOfflineSettingsForm({
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
            useHandoverCustomizationChatOfflineSettingsForm({
                integration: mockIntegration,
            }),
        )

        // Update the form
        await act(async () => {
            result.current.updateValue(
                'offlineInstructions',
                'Updated instructions',
            )
            result.current.updateValue('shareBusinessHours', true)
        })

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
        const successToast = await screen.findByRole('status', {
            name: CHANGES_SAVED_SUCCESS,
        })
        expect(successToast).toHaveAttribute('data-intent', 'success')
        expect(result.current.isSaving).toBe(false)
    })

    it('should handle errors when saving fails', async () => {
        const mockError = new Error('Save failed')
        mockUpsertHandoverConfiguration.mockRejectedValueOnce(mockError)

        const { result } = renderHook(() =>
            useHandoverCustomizationChatOfflineSettingsForm({
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
        const errorToast = await screen.findByRole('status', {
            name: 'Save failed',
        })
        expect(errorToast).toHaveAttribute('data-intent', 'destructive')
        expect(result.current.isSaving).toBe(false)
    })

    it('should handle error with unknown error when saving fails with no error thrown', async () => {
        const mockError = 'whatever not an error'
        mockUpsertHandoverConfiguration.mockRejectedValueOnce(mockError)

        const { result } = renderHook(() =>
            useHandoverCustomizationChatOfflineSettingsForm({
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
        const errorToast = await screen.findByRole('status', {
            name: 'An unknown error occurred. Please try again',
        })
        expect(errorToast).toHaveAttribute('data-intent', 'destructive')
        expect(result.current.isSaving).toBe(false)
    })

    it('should not save form values if the offline instructions are longer than 30 characters', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatOfflineSettingsForm({
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
        const errorToast = await screen.findByRole('status', {
            name: 'Please check the form for errors',
        })
        expect(errorToast).toHaveAttribute('data-intent', 'destructive')
        expect(result.current.hasError).toBe(true)
        expect(result.current.isSaving).toBe(false)
    })
})
