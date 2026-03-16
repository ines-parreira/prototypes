import { FormField, FormSubmitButton } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { BrowserRouter } from 'react-router-dom'

import { integrationsState } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { PhoneIntegration } from 'models/integration/types'
import usePhoneNumbers from 'pages/integrations/integration/components/phone/usePhoneNumbers'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'
import VoiceIntegrationSettingsForm from '../VoiceIntegrationSettingsForm'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')

jest.mock('state/notifications/actions')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('pages/integrations/integration/components/phone/usePhoneNumbers')
jest.mock('../useVoiceSettingsForm')

const useAppSelectorMock = assumeMock(useAppSelector)
const usePhoneNumbersMock = assumeMock(usePhoneNumbers)
const useFormSubmitMock = assumeMock(useFormSubmit)

jest.mock('react-hook-form')

const useFormContextMock = assumeMock(useFormContext)

const useDeleteVoiceIntegrationMock = assumeMock(useDeletePhoneIntegration)

jest.mock('@repo/forms')
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
jest.mock('../VoiceIntegrationSettingCallRecording', () => () => (
    <div>VoiceIntegrationSettingCallRecording</div>
))
jest.mock('../VoiceIntegrationSettingCallTranscription', () => () => (
    <div>VoiceIntegrationSettingCallTranscription</div>
))
jest.mock('../VoiceIntegrationSettingSpamPrevention', () => () => (
    <div>VoiceIntegrationSettingSpamPrevention</div>
))
jest.mock('@gorgias/realtime')

describe('<VoiceIntegrationSettingsForm />', () => {
    const props = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...phoneIntegration?.meta,
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
        useAppSelectorMock.mockReturnValue({})
        usePhoneNumbersMock.mockReturnValue({
            phoneNumbers: {},
            getPhoneNumberById: jest.fn(),
            getCountryFromPhoneNumberId: jest.fn(() => 'US'),
        })
        useFormContextMock.mockReturnValue(methodsMock)
        useDeleteVoiceIntegrationMock.mockReturnValue(
            useDeleteVoiceIntegrationReturnValue,
        )
        useFormSubmitMock.mockReturnValue({ onSubmit })

        FormSubmitButtonMock.mockReturnValue(<div>FormSubmitButton</div>)
    })

    it('should render the new settings card layout', () => {
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
        expect(
            screen.getByText('VoiceIntegrationSettingSpamPrevention'),
        ).toBeInTheDocument()
    })

    it('should render spam prevention section when phone number is US', () => {
        renderComponent(props)

        expect(screen.getByText('Spam prevention')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Decide if you want agents to be warned that some calls might be spam',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('VoiceIntegrationSettingSpamPrevention'),
        ).toBeInTheDocument()
    })

    it('should not render spam prevention section when phone number is not US', () => {
        usePhoneNumbersMock.mockReturnValue({
            phoneNumbers: {},
            getPhoneNumberById: jest.fn(),
            getCountryFromPhoneNumberId: jest.fn(() => 'GB'),
        })
        renderComponent(props)

        expect(screen.queryByText('Spam prevention')).not.toBeInTheDocument()
        expect(
            screen.queryByText('VoiceIntegrationSettingSpamPrevention'),
        ).not.toBeInTheDocument()
    })

    it('should not render spam prevention section when phone number country is not found', () => {
        usePhoneNumbersMock.mockReturnValue({
            phoneNumbers: {},
            getPhoneNumberById: jest.fn(),
            getCountryFromPhoneNumberId: jest.fn(() => undefined),
        })
        renderComponent(props)

        expect(screen.queryByText('Spam prevention')).not.toBeInTheDocument()
        expect(
            screen.queryByText('VoiceIntegrationSettingSpamPrevention'),
        ).not.toBeInTheDocument()
    })

    describe('handle rendering', () => {
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
    })
})
