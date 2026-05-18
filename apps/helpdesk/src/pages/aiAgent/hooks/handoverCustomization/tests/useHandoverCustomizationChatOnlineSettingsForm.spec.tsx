import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { HandoverConfigurationData } from 'models/aiAgent/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
    IntegrationType,
} from 'models/integration/types'
import { AiAgentChannel } from 'pages/aiAgent/constants'
import {
    getHandoverConfigurationFormDataFragment,
    getIntegrationPreferencesFormDataFragment,
    mapFromFormValuesToIntegrationPreferences,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils'
import { mapFormValuesToHandoverConfigurationData } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationConfigurationData.utils'
import { updateOrCreateIntegrationRequest } from 'state/integrations/actions'

import type { HandoverCustomizationChatOnlineSettingsFormValues } from '../../../types'
import { useAiAgentHandoverConfigurationMutation } from '../useAiAgentHandoverConfigurationMutation'
import { useFetchAiAgentStoreHandoverConfiguration } from '../useFetchAiAgentHandoverConfiguration'
import { useHandoverCustomizationChatOnlineSettingsForm } from '../useHandoverCustomizationChatOnlineSettingsForm'

// Mock dependencies
jest.mock('hooks/useAppSelector')
jest.mock('hooks/useAppDispatch')

jest.mock('state/integrations/actions')

jest.mock('../useFetchAiAgentHandoverConfiguration', () => ({
    useFetchAiAgentStoreHandoverConfiguration: jest.fn(),
}))

jest.mock('../useAiAgentHandoverConfigurationMutation', () => ({
    useAiAgentHandoverConfigurationMutation: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils',
    () => ({
        ...jest.requireActual(
            'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils',
        ),
        formFieldsConfiguration: {
            onlineInstructions: {
                friendlyName: 'Online instructions',
                required: false,
                maxLength: 30,
            },
            shareBusinessHours: {
                friendlyName: 'Share business hours',
                required: false,
            },
        },
        getIntegrationPreferencesFormDataFragment: jest.fn(),
        getHandoverConfigurationFormDataFragment: jest.fn(),
        mapFromFormValuesToIntegrationPreferences: jest.fn(),
    }),
)

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationConfigurationData.utils',
    () => ({
        mapFormValuesToHandoverConfigurationData: jest.fn(),
    }),
)

const defaultState = {}

// Mock functions
const mockRefetch = jest.fn().mockResolvedValue({})
const mockUpsertHandoverConfiguration = jest.fn()
const mockUseAppSelector = useAppSelector as jest.Mock

const renderHookWithProviders = (integration: GorgiasChatIntegration) => {
    return renderHook(
        () => useHandoverCustomizationChatOnlineSettingsForm({ integration }),
        {
            storeState: defaultState,
        },
    )
}

// Mock data
const mockIntegration: GorgiasChatIntegration = {
    id: 456,
    type: IntegrationType.GorgiasChat,
    meta: {
        shop_name: 'Test Shop',
        shop_type: 'Test Type',
    },
} as unknown as GorgiasChatIntegration

const mockInitialFormValues: HandoverCustomizationChatOnlineSettingsFormValues =
    {
        onlineInstructions: '',
        emailCaptureEnabled: false,
        emailCaptureEnforcement: GorgiasChatEmailCaptureType.Optional,
        autoResponderEnabled: false,
        autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
    }

describe('useHandoverCustomizationChatOnlineSettingsForm', () => {
    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        dispatch = jest.fn()

        useAppDispatchMock.mockReturnValue(dispatch)

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
            getIntegrationPreferencesFormDataFragment as jest.Mock
        ).mockReturnValue({
            emailCaptureEnabled: false,
            emailCaptureEnforcement: GorgiasChatEmailCaptureType.Optional,
            autoResponderEnabled: false,
            autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
        })
        ;(
            getHandoverConfigurationFormDataFragment as jest.Mock
        ).mockReturnValue({
            onlineInstructions: '',
        })
        ;(updateOrCreateIntegrationRequest as jest.Mock).mockResolvedValue({})
    })

    it('should initialize with default form values', () => {
        ;(
            getIntegrationPreferencesFormDataFragment as jest.Mock
        ).mockReturnValue({
            emailCaptureEnabled: mockInitialFormValues.emailCaptureEnabled,
            emailCaptureEnforcement:
                mockInitialFormValues.emailCaptureEnforcement,
            autoResponderEnabled: mockInitialFormValues.autoResponderEnabled,
            autoResponderReply: mockInitialFormValues.autoResponderReply,
        })
        ;(
            getHandoverConfigurationFormDataFragment as jest.Mock
        ).mockReturnValue({
            onlineInstructions: mockInitialFormValues.onlineInstructions,
        })

        const { result } = renderHookWithProviders(mockIntegration)

        expect(result.current.formValues).toEqual(mockInitialFormValues)
    })

    test.each([
        ['onlineInstructions', 'New instructions'],
        ['emailCaptureEnabled', true],
        [
            'emailCaptureEnforcement',
            GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
        ],
        ['autoResponderEnabled', true],
        ['autoResponderReply', GorgiasChatAutoResponderReply.ReplyInDay],
    ])('should update form values field %s correctly', (field, value) => {
        const { result } = renderHookWithProviders(mockIntegration)

        act(() => {
            result.current.updateValue(
                field as keyof HandoverCustomizationChatOnlineSettingsFormValues,
                value,
            )
        })

        expect(result.current.formValues).toEqual({
            ...mockInitialFormValues,
            [field]: value,
        })

        expect(result.current.hasChanges).toBeTruthy()
        expect(result.current.hasError).toBeFalsy()
    })

    it('should handle cancel changes correctly, resetting form values to initial values', () => {
        const { result } = renderHookWithProviders(mockIntegration)

        act(() => {
            result.current.updateValue('onlineInstructions', 'New instructions')
        })

        act(() => {
            result.current.updateValue('emailCaptureEnabled', true)
        })

        act(() => {
            result.current.updateValue('autoResponderEnabled', true)
        })

        expect(result.current.formValues).toEqual({
            ...mockInitialFormValues,
            onlineInstructions: 'New instructions',
            emailCaptureEnabled: true,
            autoResponderEnabled: true,
        })

        expect(result.current.hasChanges).toBeTruthy()

        act(() => {
            result.current.handleOnCancel()
        })

        expect(result.current.formValues).toEqual(mockInitialFormValues)

        expect(result.current.hasChanges).toBeFalsy()
    })

    it('should not do anything if there are no changes in the form and clicked on save', () => {
        const { result } = renderHookWithProviders(mockIntegration)

        expect(result.current.hasChanges).toBeFalsy()

        act(() => {
            result.current.handleOnSave()
        })

        expect(mockUpsertHandoverConfiguration).not.toHaveBeenCalled()

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    describe('save changes', () => {
        it('should trigger upsertHandoverConfiguration and notifySuccess when saving the form values correctly with only handover configuration changes', async () => {
            const expectedHandoverConfigurationData: HandoverConfigurationData =
                {
                    accountId: 123,
                    storeName: 'Test Shop',
                    shopType: 'Test Type',
                    integrationId: 456,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: 'New instructions',
                    offlineInstructions: null,
                    shareBusinessHours: false,
                }

            ;(
                mapFormValuesToHandoverConfigurationData as jest.Mock
            ).mockReturnValue(expectedHandoverConfigurationData)

            const { result } = renderHookWithProviders(mockIntegration)

            const newFormValues = {
                ...mockInitialFormValues,
                onlineInstructions: 'New instructions',
            }

            act(() => {
                result.current.updateValue(
                    'onlineInstructions',
                    newFormValues.onlineInstructions,
                )
            })

            result.current.handleOnSave()

            await waitFor(() => {
                expect(
                    mapFormValuesToHandoverConfigurationData,
                ).toHaveBeenCalled()

                expect(mockUpsertHandoverConfiguration).toHaveBeenCalledWith(
                    expectedHandoverConfigurationData,
                )

                expect(
                    mapFromFormValuesToIntegrationPreferences,
                ).not.toHaveBeenCalled()

                expect(dispatch).not.toHaveBeenCalled()

                expect(result.current.isSaving).toBeFalsy()
            })

            const toastEl = await screen.findByRole('status')
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('should trigger upsertHandoverConfiguration and notifyError when saving the form values fails with only handover configuration changes', async () => {
            const expectedHandoverConfigurationData: HandoverConfigurationData =
                {
                    accountId: 123,
                    storeName: 'Test Shop',
                    shopType: 'Test Type',
                    integrationId: 456,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: 'New instructions',
                    offlineInstructions: null,
                    shareBusinessHours: false,
                }

            ;(
                mapFormValuesToHandoverConfigurationData as jest.Mock
            ).mockReturnValue(expectedHandoverConfigurationData)

            mockUpsertHandoverConfiguration.mockRejectedValue(
                new Error('Error'),
            )

            const { result } = renderHookWithProviders(mockIntegration)

            const newFormValues = {
                ...mockInitialFormValues,
                onlineInstructions: 'New instructions',
            }

            act(() => {
                result.current.updateValue(
                    'onlineInstructions',
                    newFormValues.onlineInstructions,
                )
            })

            result.current.handleOnSave()

            await waitFor(() => {
                expect(
                    mapFormValuesToHandoverConfigurationData,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        accountId: expectedHandoverConfigurationData.accountId,
                        storeName: expectedHandoverConfigurationData.storeName,
                        shopType: expectedHandoverConfigurationData.shopType,
                        integrationId:
                            expectedHandoverConfigurationData.integrationId,
                        integrationType: IntegrationType.GorgiasChat,
                        formValues: newFormValues,
                    }),
                )

                expect(mockUpsertHandoverConfiguration).toHaveBeenCalledWith(
                    expectedHandoverConfigurationData,
                )

                expect(
                    mapFromFormValuesToIntegrationPreferences,
                ).not.toHaveBeenCalled()

                expect(dispatch).not.toHaveBeenCalled()
            })

            const toastEl = await screen.findByRole('status')
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should trigger dispatch and notifySuccess when saving the form values correctly with only preferences changes', async () => {
        dispatch.mockImplementation((arg) => {
            arg()
            return Promise.resolve({})
        })
        // this is to to force the dispatch to be called and resolved the promise then
        ;(updateOrCreateIntegrationRequest as jest.Mock).mockImplementation(
            (...args) => {
                args[4]?.()
                return Promise.resolve({})
            },
        )

        const expectedIntegrationPreferencesData = {
            emailCaptureEnabled: true,
            emailCaptureEnforcement:
                GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
        }

        ;(
            mapFromFormValuesToIntegrationPreferences as jest.Mock
        ).mockReturnValue(expectedIntegrationPreferencesData)

        const { result } = renderHookWithProviders(mockIntegration)

        const newFormValues = {
            ...mockInitialFormValues,
            emailCaptureEnabled: true,
            emailCaptureEnforcement:
                GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
        }

        act(() => {
            result.current.updateValue(
                'emailCaptureEnabled',
                newFormValues.emailCaptureEnabled,
            )
        })

        act(() => {
            result.current.updateValue(
                'emailCaptureEnforcement',
                newFormValues.emailCaptureEnforcement,
            )
        })

        result.current.handleOnSave()

        await waitFor(() => {
            expect(
                mapFromFormValuesToIntegrationPreferences,
            ).toHaveBeenCalledWith(newFormValues, mockIntegration)

            expect(mockUpsertHandoverConfiguration).not.toHaveBeenCalled()

            expect(dispatch).toHaveBeenCalled()

            expect(updateOrCreateIntegrationRequest).toHaveBeenCalled()

            expect(result.current.isSaving).toBeFalsy()
        })

        const toastEl = await screen.findByRole('status')
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should trigger all saves when there are changes in both handover configuration and preferences', async () => {
        const expectedHandoverConfigurationData: HandoverConfigurationData = {
            accountId: 123,
            storeName: 'Test Shop',
            shopType: 'Test Type',
            integrationId: 456,
            channel: AiAgentChannel.Chat,
            onlineInstructions: 'New instructions',
            offlineInstructions: null,
            shareBusinessHours: false,
        }

        ;(
            mapFormValuesToHandoverConfigurationData as jest.Mock
        ).mockReturnValue(expectedHandoverConfigurationData)

        dispatch.mockImplementation((arg) => {
            arg()
            return Promise.resolve({})
        })
        // this is to to force the dispatch to be called and resolved the promise then
        ;(updateOrCreateIntegrationRequest as jest.Mock).mockImplementation(
            (...args) => {
                args[4]?.()
                return Promise.resolve({})
            },
        )

        const expectedIntegrationPreferencesData = {
            emailCaptureEnabled: true,
            emailCaptureEnforcement:
                GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
        }

        ;(
            mapFromFormValuesToIntegrationPreferences as jest.Mock
        ).mockReturnValue(expectedIntegrationPreferencesData)

        const newFormValues = {
            ...mockInitialFormValues,
            emailCaptureEnabled: true,
            emailCaptureEnforcement:
                GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
            onlineInstructions: 'New instructions',
        }

        const { result } = renderHookWithProviders(mockIntegration)

        act(() => {
            result.current.updateValue(
                'emailCaptureEnabled',
                newFormValues.emailCaptureEnabled,
            )
        })

        act(() => {
            result.current.updateValue(
                'emailCaptureEnforcement',
                newFormValues.emailCaptureEnforcement,
            )
        })

        act(() => {
            result.current.updateValue(
                'onlineInstructions',
                newFormValues.onlineInstructions,
            )
        })

        result.current.handleOnSave()

        await waitFor(() => {
            expect(mapFormValuesToHandoverConfigurationData).toHaveBeenCalled()

            expect(mapFromFormValuesToIntegrationPreferences).toHaveBeenCalled()

            expect(mockUpsertHandoverConfiguration).toHaveBeenCalled()

            expect(dispatch).toHaveBeenCalled()

            expect(updateOrCreateIntegrationRequest).toHaveBeenCalled()

            expect(result.current.isSaving).toBeFalsy()
        })

        const toastEl = await screen.findByRole('status')
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should handle form errors when the online instructions field is bigger than the max length', async () => {
        const { result } = renderHookWithProviders(mockIntegration)

        act(() => {
            result.current.updateValue(
                'onlineInstructions',
                'Modified message with more than 30 characters',
            )
        })

        await result.current.handleOnSave()

        await waitFor(() => {
            expect(result.current.hasError).toBe(true)

            expect(result.current.isSaving).toBe(false)

            expect(
                mapFormValuesToHandoverConfigurationData,
            ).not.toHaveBeenCalled()

            expect(
                mapFromFormValuesToIntegrationPreferences,
            ).not.toHaveBeenCalled()

            expect(mockUpsertHandoverConfiguration).not.toHaveBeenCalled()

            expect(dispatch).not.toHaveBeenCalled()
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Please check the form for errors',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
