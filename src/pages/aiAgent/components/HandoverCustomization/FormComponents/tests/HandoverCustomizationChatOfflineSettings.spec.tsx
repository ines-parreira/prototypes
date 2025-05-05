import { fireEvent, render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import HandoverCustomizationChatOfflineSettings from '../HandoverCustomizationChatOfflineSettings'

// Mock dependencies
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm',
)

jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext')

const QueryClientProvider = mockQueryClientProvider()

const defaultState = {}

const mockedIntegration = {
    type: 'gorgias_chat',
    id: '1',
    meta: {
        shop_name: 'test-store',
        shop_type: 'shopify',
        shop_id: '123',
        shop_domain: 'test-store.myshopify.com',
    },
} as unknown as GorgiasChatIntegration

const renderComponent = (
    integration: GorgiasChatIntegration = mockedIntegration,
) => {
    render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider>
                <HandoverCustomizationChatOfflineSettings
                    integration={integration}
                />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('HandoverCustomizationOfflineSettings', () => {
    const mockUpdateValue = jest.fn()
    const mockHandleOnSave = jest.fn()
    const mockHandleOnCancel = jest.fn()

    const mockSetIsFormDirty = jest.fn()
    const mockSetActionCallback = jest.fn()

    const mockOfflineValuesForm = {
        formValues: {
            offlineInstructions: 'Default instructions',
            shareBusinessHours: false,
        },
        updateValue: mockUpdateValue,
        handleOnSave: mockHandleOnSave,
        handleOnCancel: mockHandleOnCancel,
        isLoading: false,
        isSaving: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Default mock implementation
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue(mockOfflineValuesForm)
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            setIsFormDirty: mockSetIsFormDirty,
            setActionCallback: mockSetActionCallback,
        })
    })

    it.each([true, false])(
        'should render the loading state when the form data is loading and isSettingsRevamp is %s',
        (isSettingsRevamp) => {
            ;(useFlags as jest.Mock).mockReturnValue({
                [FeatureFlagKey.AiAgentSettingsRevamp]: isSettingsRevamp,
            })
            ;(
                useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
            ).mockReturnValue({
                ...mockOfflineValuesForm,
                isLoading: true,
            })

            renderComponent()

            // Check the loading spinner is rendered
            screen.getByText(/loading/i)

            expect(screen.queryByText(/Guidance/i)).toBeNull()
        },
    )

    it('renders correctly with all UI elements', () => {
        renderComponent()

        expect(screen.getByText('Guidance')).toBeInTheDocument() // text area
        screen.getByRole('textbox')

        // text area
        expect(screen.getByRole('textbox')).toBeInTheDocument()

        expect(
            screen.getByText(
                /AI Agent will use these instructions to craft the handover message it sends to customers./i,
            ),
        ).toBeInTheDocument()

        // Check the toggle is rendered
        expect(
            screen.getByRole('checkbox', {
                name: /Share business hours in handover message/i,
            }),
        ).toBeInTheDocument()

        // explanation text
        expect(
            screen.getByText('Share business hours in handover message'),
        ).toBeInTheDocument()

        // link
        expect(screen.getByText('View Business Hours')).toBeInTheDocument()

        // Check business hours link
        const link = screen.getByText('View Business Hours')

        expect(link).toHaveAttribute('href', '/app/settings/business-hours')
        expect(link).toHaveAttribute('target', '_blank')

        // Check buttons are rendered
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders correctly with all UI elements in the new setting design', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentSettingsRevamp]: true,
        })

        renderComponent()

        expect(screen.getByText('Instructions')).toBeInTheDocument()
        expect(screen.queryByText('Guidance')).toBeNull()

        // text area
        expect(screen.getByRole('textbox')).toBeInTheDocument()

        expect(
            screen.getByText(
                /Write optional instructions for AI Agent to follow during handover./i,
            ),
        ).toBeInTheDocument()

        // Check the toggle is rendered
        expect(
            screen.getByRole('checkbox', {
                name: /Share business hours in handover message/i,
            }),
        ).toBeInTheDocument()

        // explanation text
        expect(
            screen.getByText('Share business hours in handover message'),
        ).toBeInTheDocument()

        // link
        expect(screen.getByText('View Business Hours')).toBeInTheDocument()

        // Check business hours link
        const link = screen.getByText('View Business Hours')
        expect(link).toHaveAttribute('href', '/app/settings/business-hours')
        expect(link).toHaveAttribute('target', '_blank')

        // Check buttons are rendered
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it.each([true, false])(
        'should load form with initial values loaded from the form hook and isSettingsRevamp is %s',
        (isSettingsRevamp) => {
            ;(useFlags as jest.Mock).mockReturnValue({
                [FeatureFlagKey.AiAgentSettingsRevamp]: isSettingsRevamp,
            })
            const mockedForm = {
                ...mockOfflineValuesForm,
                formValues: {
                    offlineInstructions: 'Initial instructions',
                    shareBusinessHours: true,
                },
            }

            ;(
                useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
            ).mockReturnValue(mockedForm)

            renderComponent()

            screen.getByText('Initial instructions')

            expect(
                screen.getByRole('checkbox', {
                    name: /Share business hours in handover message/i,
                }),
            ).toBeChecked()
        },
    )

    it.each([true, false])(
        'should build the correct action callback when the component is mounted and isSettingsRevamp is %s',
        (isSettingsRevamp) => {
            ;(useFlags as jest.Mock).mockReturnValue({
                [FeatureFlagKey.AiAgentSettingsRevamp]: isSettingsRevamp,
            })

            renderComponent()

            expect(mockSetActionCallback).toHaveBeenCalledWith(
                StoreConfigFormSection.handoverCustomizationOfflineSettings,
                expect.objectContaining({
                    onDiscard: mockHandleOnCancel,
                }),
            )
        },
    )

    describe.each([true, false])(
        'offline instructions and isSettingsRevamp is %s',
        (isSettingsRevamp) => {
            beforeEach(() => {
                ;(useFlags as jest.Mock).mockReturnValue({
                    [FeatureFlagKey.AiAgentSettingsRevamp]: isSettingsRevamp,
                })
            })

            it('should render the placeholder text when the textarea is empty', () => {
                const mockedForm = {
                    ...mockOfflineValuesForm,
                    formValues: {
                        offlineInstructions: '',
                        shareBusinessHours: false,
                    },
                }
                ;(
                    useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
                ).mockReturnValue(mockedForm)

                renderComponent()

                expect(
                    screen.getByPlaceholderText(
                        /Apologize and acknowledge the issue./i,
                    ),
                ).toHaveValue('')
            })
            it('should change the offline instructions when the user types in the text area', () => {
                renderComponent()

                const textArea = screen.getByRole('textbox')
                fireEvent.change(textArea, {
                    target: { value: 'New instructions' },
                })

                expect(mockUpdateValue).toHaveBeenCalledWith(
                    'offlineInstructions',
                    'New instructions',
                )
            })
        },
    )

    describe.each([true, false])(
        'share business hours and isSettingsRevamp is %s',
        (isSettingsRevamp) => {
            beforeEach(() => {
                ;(useFlags as jest.Mock).mockReturnValue({
                    [FeatureFlagKey.AiAgentSettingsRevamp]: isSettingsRevamp,
                })
            })

            it('should change the share business hours when the user clicks the checkbox', () => {
                const mockedForm = {
                    ...mockOfflineValuesForm,
                    formValues: {
                        offlineInstructions: 'Initial instructions',
                        shareBusinessHours: true,
                    },
                }

                ;(
                    useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
                ).mockReturnValue(mockedForm)

                renderComponent()

                const checkbox = screen.getByRole('checkbox', {
                    name: /Share business hours in handover message/i,
                })

                fireEvent.click(checkbox)

                expect(mockUpdateValue).toHaveBeenCalledWith(
                    'shareBusinessHours',
                    false,
                )
            })

            it('calls handleOnSave when Save Changes button is clicked', () => {
                renderComponent()

                const saveButton = screen.getByText('Save Changes')
                fireEvent.click(saveButton)

                expect(mockHandleOnSave).toHaveBeenCalled()
            })

            describe('form handlers', () => {
                it('calls handleOnCancel when Cancel button is clicked', () => {
                    renderComponent()

                    const cancelButton = screen.getByText('Cancel')
                    fireEvent.click(cancelButton)

                    expect(mockHandleOnCancel).toHaveBeenCalled()
                })

                it('calls handleOnSave when Save Changes button is clicked', () => {
                    renderComponent()

                    const saveButton = screen.getByText('Save Changes')
                    fireEvent.click(saveButton)

                    expect(mockHandleOnSave).toHaveBeenCalled()
                })

                it('should disable the save button when the form is saving', () => {
                    ;(
                        useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
                    ).mockReturnValue({
                        ...mockOfflineValuesForm,
                        isSaving: true,
                    })

                    renderComponent()

                    const saveButton = screen.getByRole('button', {
                        name: 'Save Changes',
                    })

                    expect(saveButton).toHaveAttribute('aria-disabled', 'true')
                })
            })
        },
    )

    test.each([true, false])(
        'should set isFormDirty to %s when there are changes coming from the form hook',
        (hasChanges) => {
            ;(
                useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
            ).mockReturnValue({
                ...mockOfflineValuesForm,
                hasChanges,
            })
            renderComponent()

            expect(mockSetIsFormDirty).toHaveBeenCalledWith(
                StoreConfigFormSection.handoverCustomizationOfflineSettings,
                hasChanges,
            )
        },
    )
})
