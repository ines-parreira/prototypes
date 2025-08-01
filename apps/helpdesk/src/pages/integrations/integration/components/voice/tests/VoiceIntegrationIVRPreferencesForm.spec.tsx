import { assumeMock } from '@repo/testing'
import {
    act,
    fireEvent,
    render,
    RenderResult,
    screen,
    waitFor,
} from '@testing-library/react'

import { PhoneIntegration } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { integrationsState } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import VoiceIntegrationIVRPreferencesForm from 'pages/integrations/integration/components/voice/VoiceIntegrationIVRPreferencesForm'

import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'

jest.mock('../useVoiceSettingsForm')
const useFormSubmitMock = assumeMock(useFormSubmit)
const useDeletePhoneIntegrationMock = assumeMock(useDeletePhoneIntegration)

jest.mock(
    'pages/common/components/FormUnsavedChangesPrompt',
    () => (props: any) => (
        <div
            data-testid="unsaved-changes-prompt"
            onClick={() => props.onSave()}
        >
            FormUnsavedChangesPrompt
        </div>
    ),
)

jest.mock('../VoiceIntegrationSettingsFormGeneralSection', () => () => (
    <div>VoiceIntegrationSettingsFormGeneralSection</div>
))

describe('<VoiceIntegrationIVRPreferencesForm /> - Form State Tests', () => {
    const phoneIntegration = integrationsState.integrations.find(
        (integration) => integration.type === IntegrationType.Phone,
    ) as unknown as PhoneIntegration

    const mockIntegration = {
        ...phoneIntegration,
        meta: {
            ...(phoneIntegration?.meta ?? {}),
            preferences: {
                voicemail_outside_business_hours: true,
            },
        },
    }

    const mockOnSubmit = jest.fn()
    const mockPerformDelete = jest.fn()
    const defaultValues = {
        name: 'Test Integration',
        meta: {
            preferences: {
                voicemail_outside_business_hours: true,
            },
        },
    }

    const renderComponent = (
        values: any = defaultValues,
        props: any = {},
    ): RenderResult => {
        const defaultProps = {
            integration: mockIntegration,
        }

        return render(
            <Form defaultValues={values} onValidSubmit={mockOnSubmit}>
                <VoiceIntegrationIVRPreferencesForm
                    {...defaultProps}
                    {...props}
                />
            </Form>,
        )
    }

    beforeEach(() => {
        useFormSubmitMock.mockReturnValue({
            onSubmit: mockOnSubmit,
        })
        useDeletePhoneIntegrationMock.mockReturnValue({
            isDeleting: false,
            performDelete: mockPerformDelete,
        })
    })

    it('should disable the submit button when form is not dirty', () => {
        renderComponent()

        const submitButton = screen.getByRole('button', {
            name: 'Save changes',
        })
        expect(submitButton).toBeAriaDisabled()
    })

    it('should enable the submit button when form is dirty and valid', async () => {
        renderComponent({
            values: {
                ...defaultValues,
                meta: {
                    preferences: {
                        voicemail_outside_business_hours: false,
                    },
                },
            },
        })

        expect(
            screen.getByLabelText(
                'Send calls to voicemail outside business hours',
            ),
        ).not.toBeChecked()

        act(() => {
            fireEvent.click(
                screen.getByLabelText(
                    'Send calls to voicemail outside business hours',
                ),
            )
        })

        const submitButton = screen.getByRole('button', {
            name: 'Save changes',
        })
        await waitFor(() => {
            expect(submitButton).toBeAriaEnabled()
            expect(
                screen.getByLabelText(
                    'Send calls to voicemail outside business hours',
                ),
            ).toBeChecked()
        })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled()
        })
    })

    it('should disable the submit button when form is dirty but invalid', async () => {
        renderComponent({
            values: {
                name: '',
                meta: {
                    preferences: {
                        voicemail_outside_business_hours: false,
                    },
                },
            },
        })

        const checkbox = screen.getByLabelText(
            'Send calls to voicemail outside business hours',
        )
        expect(checkbox).not.toBeChecked()

        act(() => {
            fireEvent.click(checkbox)
        })

        await waitFor(() => {
            expect(checkbox).toBeChecked()
            const submitButton = screen.getByRole('button', {
                name: 'Save changes',
            })
            expect(submitButton).toBeAriaDisabled()
        })
    })
})
