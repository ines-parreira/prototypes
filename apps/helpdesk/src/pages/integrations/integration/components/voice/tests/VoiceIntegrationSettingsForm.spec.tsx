import { assumeMock } from '@repo/testing'
import { fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { BrowserRouter } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { FormField, FormSubmitButton } from 'core/forms'
import { integrationsState } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import { PhoneIntegration } from 'models/integration/types'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import { getNewPhoneNumber } from 'state/entities/phoneNumbers/selectors'

import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'
import VoiceIntegrationSettingsForm from '../VoiceIntegrationSettingsForm'

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

jest.mock('core/flags')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/entities/phoneNumbers/selectors')
jest.mock('../useVoiceSettingsForm')

const useFormSubmitMock = assumeMock(useFormSubmit)
const useFlagMock = assumeMock(useFlag)

jest.mock('react-hook-form')

const getNewPhoneNumberMock = assumeMock(getNewPhoneNumber)

const useFormContextMock = assumeMock(useFormContext)

const useDeleteVoiceIntegrationMock = assumeMock(useDeletePhoneIntegration)

jest.mock('core/forms')
const FormSubmitButtonMock = assumeMock(FormSubmitButton)
const FormFieldMock = assumeMock(FormField)

// eslint-disable-next-line no-unused-vars
const mockUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>UnsavedChangesPrompt</div>
))

// Mock the module
jest.mock('pages/common/components/UnsavedChangesPrompt', () => {
    const { forwardRef } = jest.requireActual('react')

    return {
        __esModule: true,
        default: forwardRef((props: any) =>
            mockUnsavedChangesPrompt(props as any),
        ),
    }
})

jest.mock('../VoiceFormSubmitButton', () => ({ children }: any) => (
    <button type="submit">{children}</button>
))
jest.mock('../VoiceIntegrationSettingsFormCallFlowSection', () => () => (
    <div>VoiceIntegrationSettingsFormCallFlowSection</div>
))
jest.mock('../VoiceIntegrationSettingsFormCallFlowSection', () => () => (
    <div>VoiceIntegrationSettingsFormCallFlowSection</div>
))
jest.mock('../VoiceIntegrationSettingCallRecording', () => () => (
    <div>VoiceIntegrationSettingCallRecording</div>
))
jest.mock('../VoiceIntegrationSettingCallTranscription', () => () => (
    <div>VoiceIntegrationSettingCallTranscription</div>
))

describe('<VoiceIntegrationSettingsForm />', () => {
    const props = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...(phoneIntegration?.meta ?? {}),
                phone_team_id: 1,
            },
        },
    }
    const methodsMock = {
        register: jest.fn(),
        handleSubmit: jest.fn(),
        setValue: jest.fn(),
        formState: {
            isDirty: false,
            isValid: true,
        },
        watch: jest.fn(),
    } as unknown as ReturnType<typeof useFormContext>

    const useDeleteVoiceIntegrationReturnValue = {
        isDeleting: false,
        performDelete: jest.fn(),
    }

    const onSubmit = jest.fn()

    const renderComponent = (props: any = {}): RenderResult =>
        render(
            <BrowserRouter>
                <VoiceIntegrationSettingsForm {...props} />
            </BrowserRouter>,
        )

    beforeEach(() => {
        FormFieldMock.mockReturnValue(<div>FormField</div>)
        getNewPhoneNumberMock.mockReturnValue((() => {
            '+1 500 500 5005'
        }) as any)
        useFormContextMock.mockReturnValue(methodsMock)
        useDeleteVoiceIntegrationMock.mockReturnValue(
            useDeleteVoiceIntegrationReturnValue,
        )
        useFormSubmitMock.mockReturnValue({ onSubmit })

        FormSubmitButtonMock.mockReturnValue(<div>FormSubmitButton</div>)

        // Default to ExtendedCallFlows false
        useFlagMock.mockReturnValue(false)
    })

    it('should render the component [FF off]', () => {
        renderComponent(props)

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()
        expect(screen.getByText('Call settings')).toBeInTheDocument()
        expect(
            screen.getByText('Configure how incoming calls are handled'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('VoiceIntegrationSettingsFormCallFlowSection'),
        ).toBeInTheDocument()

        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Delete integration')).toBeInTheDocument()
    })

    it('should render the new settings card layout', () => {
        useFlagMock.mockReturnValue(true)
        renderComponent(props)

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Edit the name, phone number and business hours associated with your voice integration',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Call recording')).toBeInTheDocument()
        expect(
            screen.getByText('Toggle call recording on / off'),
        ).toBeInTheDocument()
        expect(screen.getByText('Call transcription')).toBeInTheDocument()
        expect(
            screen.getByText('Toggle automatic call transcription on / off'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('VoiceIntegrationSettingCallRecording'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('VoiceIntegrationSettingCallTranscription'),
        ).toBeInTheDocument()
    })

    describe.each([true, false])(
        'when ExtendedCallFlows feature flag is %s',
        (isExtendedCallFlowsEnabled) => {
            beforeEach(() => {
                useFlagMock.mockReturnValue(isExtendedCallFlowsEnabled)
            })

            it('should display delete warning message and it should not contain text about "saved filters"', () => {
                const { getByText, getByRole } = renderComponent(props)

                fireEvent.click(
                    getByRole('button', { name: /Delete integration/i }),
                )

                expect(
                    getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
                ).toBeInTheDocument()
            })

            it('should pass correct props to Integration name field', () => {
                // @ts-ignore
                methodsMock.watch = jest.fn(() => 'emoji')
                renderComponent(props)

                expect(FormFieldMock).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        name: 'name',
                        emoji: 'emoji',
                        field: expect.any(Function),
                        placeholder: 'Ex: Company Support Line',
                        isRequired: true,
                    }),
                    {},
                )
            })

            it('should not display UnsavedChangesPrompt when form is not dirty', () => {
                methodsMock.formState.isDirty = false

                renderComponent(props)

                expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
                    expect.objectContaining({ when: false }),
                )
            })

            it('should display UnsavedChangesPrompt when form is dirty', () => {
                methodsMock.formState.isDirty = true

                renderComponent(props)

                expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
                    expect.objectContaining({ when: true }),
                )
            })
        },
    )
})
