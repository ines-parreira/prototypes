import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import * as useAppSelectorModule from 'hooks/useAppSelector'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import * as useStoreConfigurationFormModule from 'pages/aiAgent/hooks/useStoreConfigurationForm'
import { FormValues } from 'pages/aiAgent/types'
import * as useStandaloneIntegrationUpsertModule from 'pages/standalone/hooks/useStandaloneIntegrationUpsert'
import * as handoverSchemaModule from 'pages/standalone/schemas'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'

import { HandoverConfigurationDrawer } from '../HandoverConfigurationDrawer'

// Mock the dependencies
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useStoreConfigurationForm')
jest.mock('pages/standalone/hooks/useStandaloneIntegrationUpsert')

describe('<HandoverConfigurationDrawer />', () => {
    const mockUseAppSelector = jest.fn()
    const mockSetFormValues = jest.fn()
    const mockHandleOnSave = jest.fn()
    const mockUpsert = jest.fn()

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        shopName: 'Test Shop',
        shopType: 'shopify',
        faqHelpcenters: [],
    }

    const mockEmailIntegrations = [
        {
            id: 1,
            meta: { address: 'test@example.com' },
            type: EMAIL_INTEGRATION_TYPES[0],
        },
        {
            id: 2,
            meta: { address: 'another@example.com' },
            type: EMAIL_INTEGRATION_TYPES[0],
        },
    ]

    // Complete FormValues mock with all required properties
    const mockStoreConfig: FormValues = {
        handoverMethod: 'email',
        handoverEmail: 'customer@example.com',
        handoverEmailIntegrationId: 1,
        handoverHttpIntegrationId: null,
        conversationBot: null,
        useEmailIntegrationSignature: false,
        emailChannelDeactivatedDatetime: null,
        chatChannelDeactivatedDatetime: null,
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        previewModeValidUntilDatetime: null,
        ticketSampleRate: null,
        silentHandover: null,
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: [],
        tags: [],
        excludedTopics: [],
        signature: null,
        toneOfVoice: null,
        aiAgentLanguage: null,
        customToneOfVoiceGuidance: null,
        helpCenterId: null,
        wizard: undefined,
        customFieldIds: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock useAppSelector
        jest.spyOn(useAppSelectorModule, 'default').mockImplementation(
            mockUseAppSelector,
        )
        mockUseAppSelector.mockReturnValue(mockEmailIntegrations)

        // Mock useStoreConfigurationForm with minimal required properties
        jest.spyOn(
            useStoreConfigurationFormModule,
            'useStoreConfigurationForm',
        ).mockReturnValue({
            setFormValues: mockSetFormValues,
            handleOnSave: mockHandleOnSave,
            formValues: mockStoreConfig,
            isEmailChannelEnabled: true,
            isChatChannelEnabled: true,
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        // Mock useHandoverSchema with a simple mock that can be returned
        const mockSchema = z.object({}).superRefine(() => {}) as any
        jest.spyOn(
            handoverSchemaModule,
            'handoverSchema',
            'get',
        ).mockReturnValue(mockSchema)

        // Mock useStandaloneIntegrationUpsert
        jest.spyOn(
            useStandaloneIntegrationUpsertModule,
            'useStandaloneIntegrationUpsert',
        ).mockReturnValue({
            upsert: mockUpsert,
            currentIntegrationType: HelpdeskIntegrationOptions.ZENDESK,
        })
    })

    it('changes handover method when clicking on radio buttons', async () => {
        render(<HandoverConfigurationDrawer {...defaultProps} />)

        // Initial state should have Email selected
        const emailRadioSelector = screen.getByText('Email').closest('div')
        expect(emailRadioSelector).toBeInTheDocument()

        // Click on Gorgias radio button
        fireEvent.click(screen.getByText('Gorgias'))

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Email from which handover emails will be sent',
                ),
            ).not.toBeInTheDocument()
        })

        // Click on Webhook radio button
        fireEvent.click(screen.getByText('Webhook'))

        // Webhook-specific fields should be visible
        await waitFor(() => {
            expect(
                screen.getByText('Select a third-party integration'),
            ).toBeInTheDocument()
        })
    })

    it('displays webhook fields when webhook method is selected', () => {
        // Set initial values to show webhook is selected
        jest.spyOn(
            useStoreConfigurationFormModule,
            'useStoreConfigurationForm',
        ).mockReturnValue({
            setFormValues: mockSetFormValues,
            handleOnSave: mockHandleOnSave,
            formValues: {
                ...mockStoreConfig,
                handoverMethod: 'webhook',
                handoverHttpIntegrationId: 123, // Adding an integration ID
            },
            isEmailChannelEnabled: true,
            isChatChannelEnabled: true,
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(<HandoverConfigurationDrawer {...defaultProps} />)

        // Webhook UI elements should be displayed
        expect(
            screen.getByText('Select a third-party integration'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                '✅ Webhook already configured. Adjust the fields below to edit it.',
            ),
        ).toBeInTheDocument()
    })

    it('submits form with email method values', async () => {
        render(<HandoverConfigurationDrawer {...defaultProps} />)

        // Fill out the form - assuming the email input is rendered and can be accessed
        const emailField = screen.getByPlaceholderText('Enter email address')
        fireEvent.change(emailField, {
            target: { value: 'new-email@example.com' },
        })

        // Submit the form
        const saveButton = screen.getByText('Save Method')
        fireEvent.click(saveButton)

        await waitFor(() => {
            // Check if handleOnSave was called
            expect(mockHandleOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopName: 'Test Shop',
                    stepName: AiAgentOnboardingWizardStep.Personalize,
                }),
            )
        })
    })

    it('submits form with webhook method values', async () => {
        // Setup webhook method selected
        jest.spyOn(
            useStoreConfigurationFormModule,
            'useStoreConfigurationForm',
        ).mockReturnValue({
            setFormValues: mockSetFormValues,
            handleOnSave: mockHandleOnSave,
            formValues: {
                ...mockStoreConfig,
                handoverMethod: 'webhook',
            },
            isEmailChannelEnabled: true,
            isChatChannelEnabled: true,
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(<HandoverConfigurationDrawer {...defaultProps} />)

        // Submit the form
        const saveButton = screen.getByText('Save Method')
        fireEvent.click(saveButton)

        await waitFor(() => {
            // For webhook method, the upsert function should be called
            expect(mockUpsert).toHaveBeenCalledWith(
                HelpdeskIntegrationOptions.ZENDESK,
            )
        })
    })

    it('closes the drawer when clicking the cancel button', () => {
        render(<HandoverConfigurationDrawer {...defaultProps} />)

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        waitFor(() => {
            expect(defaultProps.onClose).toHaveBeenCalled()
        })
    })

    it('closes the drawer after successful update', async () => {
        // Mock handleOnSave to call onSuccess
        mockHandleOnSave.mockImplementation(({ onSuccess }) => {
            if (onSuccess) onSuccess()
        })

        render(<HandoverConfigurationDrawer {...defaultProps} />)

        // Submit the form
        const saveButton = screen.getByText('Save Method')
        fireEvent.click(saveButton)

        // onClose should have been called via the onSuccess callback
        await waitFor(() => {
            expect(defaultProps.onClose).toHaveBeenCalled()
        })
    })

    it('updates webhookThirdParty and webhookRequiredFields when onWebhookClick is called', async () => {
        render(<HandoverConfigurationDrawer {...defaultProps} />)

        const webhookBtn = screen.getByText('Webhook')
        fireEvent.click(webhookBtn)

        await waitFor(() => {
            expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('arrow_drop_down'))

        await waitFor(() => {
            expect(screen.getByText('Intercom')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Intercom'))

        waitFor(() => {
            expect(screen.getByText('Intercom')).toBeInTheDocument()
        })
    })

    it('handles integration creation success correctly', async () => {
        const countController = { number: 0 }
        jest.spyOn(
            useStandaloneIntegrationUpsertModule,
            'useStandaloneIntegrationUpsert',
        ).mockImplementation((_, __, onSuccess) => {
            if (countController.number > 0) {
                // We don't want to cause infinit rendering
                return {
                    upsert: () => {},
                    currentIntegrationType: HelpdeskIntegrationOptions.INTERCOM,
                }
            }
            onSuccess(999)
            countController.number += 1

            return {
                upsert: () => {},
                currentIntegrationType: HelpdeskIntegrationOptions.INTERCOM,
            }
        })

        // expect it to render without crashing
        render(<HandoverConfigurationDrawer {...defaultProps} />)
    })
})
