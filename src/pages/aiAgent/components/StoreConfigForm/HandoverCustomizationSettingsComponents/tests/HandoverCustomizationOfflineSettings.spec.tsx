import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { GorgiasChatIntegration } from 'models/integration/types'
import { useHandoverCustomizationOfflineSettingsForm } from 'pages/aiAgent/hooks/useHandoverCustomizationOfflineSettingsForm'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import HandoverCustomizationOfflineSettings from '../HandoverCustomizationOfflineSettings'

// Mock dependencies
jest.mock('pages/aiAgent/hooks/useHandoverCustomizationOfflineSettingsForm')

const QueryClientProvider = mockQueryClientProvider()

const defaultState = {}

const renderComponent = (integration: GorgiasChatIntegration) => {
    render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider>
                <HandoverCustomizationOfflineSettings
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

    const integration = {
        type: 'gorgias_chat',
        id: '1',
        meta: {
            shop_name: 'test-store',
            shop_type: 'shopify',
            shop_id: '123',
            shop_domain: 'test-store.myshopify.com',
        },
    } as unknown as GorgiasChatIntegration

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
            useHandoverCustomizationOfflineSettingsForm as jest.Mock
        ).mockReturnValue(mockOfflineValuesForm)
    })

    it('should render the loading state when the form data is loading', () => {
        ;(
            useHandoverCustomizationOfflineSettingsForm as jest.Mock
        ).mockReturnValue({
            ...mockOfflineValuesForm,
            isLoading: true,
        })

        renderComponent(integration)

        // Check the loading spinner is rendered
        screen.getByText(/loading/i)

        expect(screen.queryByText(/offline instructions/i)).toBeNull()
    })

    it('renders correctly with all UI elements', () => {
        renderComponent(integration)

        screen.getByText('Offline instructions')
        // text area
        screen.getByRole('textbox')

        screen.getByText(
            /Write optional instructions for AI Agent to follow during handover./i,
        )

        // Check the toggle is rendered
        screen.getByRole('checkbox', {
            name: /Share business hours in handover message/i,
        })

        // explanation text
        screen.getByText('Share business hours in handover message')

        // link
        screen.getByText('View Business Hours')

        // Check business hours link
        const link = screen.getByText('View Business Hours')

        expect(link).toHaveAttribute('href', '/app/settings/business-hours')
        expect(link).toHaveAttribute('target', '_blank')

        // Check buttons are rendered
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })

    it('should load form with intial values loaded from the form hook', () => {
        const mockedForm = {
            ...mockOfflineValuesForm,
            formValues: {
                offlineInstructions: 'Initial instructions',
                shareBusinessHours: true,
            },
        }

        ;(
            useHandoverCustomizationOfflineSettingsForm as jest.Mock
        ).mockReturnValue(mockedForm)

        renderComponent(integration)

        screen.getByText('Initial instructions')

        expect(
            screen.getByRole('checkbox', {
                name: /Share business hours in handover message/i,
            }),
        ).toBeChecked()
    })

    describe('offline instructions', () => {
        it('should render the placeholder text when the textarea is empty', () => {
            const mockedForm = {
                ...mockOfflineValuesForm,
                formValues: {
                    offlineInstructions: '',
                    shareBusinessHours: false,
                },
            }
            ;(
                useHandoverCustomizationOfflineSettingsForm as jest.Mock
            ).mockReturnValue(mockedForm)

            renderComponent(integration)

            expect(
                screen.getByPlaceholderText(
                    'Apologize and acknowledge the issue. Request the customers’ email address for our team to reach back.',
                ),
            ).toHaveValue('')
        })
        it('should change the offline instructions when the user types in the text area', () => {
            renderComponent(integration)

            const textArea = screen.getByRole('textbox')
            fireEvent.change(textArea, {
                target: { value: 'New instructions' },
            })

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'offlineInstructions',
                'New instructions',
            )
        })
    })

    describe('share business hours', () => {
        it('should change the share business hours when the user clicks the checkbox', () => {
            const mockedForm = {
                ...mockOfflineValuesForm,
                formValues: {
                    offlineInstructions: 'Initial instructions',
                    shareBusinessHours: true,
                },
            }

            ;(
                useHandoverCustomizationOfflineSettingsForm as jest.Mock
            ).mockReturnValue(mockedForm)

            renderComponent(integration)

            const checkbox = screen.getByRole('checkbox', {
                name: /Share business hours in handover message/i,
            })

            fireEvent.click(checkbox)

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'shareBusinessHours',
                false,
            )
        })

        it('should trigger save when the user clicks the save button with no changes', () => {
            renderComponent(integration)

            const saveButton = screen.getByText('Save Changes')
            fireEvent.click(saveButton)

            expect(mockHandleOnSave).toHaveBeenCalled()
        })

        describe('form handlers', () => {
            it('calls handleOnCancel when Cancel button is clicked', () => {
                renderComponent(integration)

                const cancelButton = screen.getByText('Cancel')
                fireEvent.click(cancelButton)

                expect(mockHandleOnCancel).toHaveBeenCalled()
            })

            it('calls handleOnSave when Save Changes button is clicked', () => {
                renderComponent(integration)

                const saveButton = screen.getByText('Save Changes')
                fireEvent.click(saveButton)

                expect(mockHandleOnSave).toHaveBeenCalled()
            })

            it('should disable the save button when the form is saving', () => {
                ;(
                    useHandoverCustomizationOfflineSettingsForm as jest.Mock
                ).mockReturnValue({
                    ...mockOfflineValuesForm,
                    isSaving: true,
                })

                renderComponent(integration)

                const saveButton = screen.getByRole('button', {
                    name: 'Save Changes',
                })

                expect(saveButton).toHaveAttribute('aria-disabled', 'true')
            })
        })
    })
})
