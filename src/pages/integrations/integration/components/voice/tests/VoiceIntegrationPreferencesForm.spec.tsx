import {RenderResult, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'
import {BrowserRouter} from 'react-router-dom'

import {FormField, FormSubmitButton} from 'core/forms'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import {PhoneIntegration} from 'models/integration/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import {assumeMock} from 'utils/testing'

import {useDeleteVoiceIntegration} from '../useDeleteVoiceIntegration'
import {useFormSubmit} from '../useVoicePreferencesForm'
import VoiceIntegrationPreferencesCallRecordings from '../VoiceIntegrationPreferencesCallRecordings'
import VoiceIntegrationPreferencesForm from '../VoiceIntegrationPreferencesForm'
import VoiceIntegrationPreferencesInboundCalls from '../VoiceIntegrationPreferencesInboundCalls'
import VoiceIntegrationPreferencesTranscription from '../VoiceIntegrationPreferencesTranscription'

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
) as unknown as PhoneIntegration

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/entities/phoneNumbers/selectors')
jest.mock('../useVoicePreferencesForm')

const useFormSubmitMock = assumeMock(useFormSubmit)

jest.mock('react-hook-form')

const getNewPhoneNumberMock = assumeMock(getNewPhoneNumber)

jest.mock('../VoiceIntegrationPreferencesInboundCalls')
jest.mock('../VoiceIntegrationPreferencesTranscription')
jest.mock('../VoiceIntegrationPreferencesCallRecordings')

const VoiceIntegrationPreferencesInboundCallsMock = assumeMock(
    VoiceIntegrationPreferencesInboundCalls
)
const VoiceIntegrationPreferencesTranscriptionMock = assumeMock(
    VoiceIntegrationPreferencesTranscription
)
const VoiceIntegrationPreferencesCallRecordingsMock = assumeMock(
    VoiceIntegrationPreferencesCallRecordings
)

const useFormContextMock = assumeMock(useFormContext)
jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

jest.mock('../useDeleteVoiceIntegration')
const useDeleteVoiceIntegrationMock = assumeMock(useDeleteVoiceIntegration)

jest.mock('core/forms')
const FormSubmitButtonMock = assumeMock(FormSubmitButton)

jest.mock('pages/common/components/UnsavedChangesPrompt')
const UnsavedChangesPromptMock = assumeMock(UnsavedChangesPrompt)

describe('<VoiceIntegrationPreferencesForm />', () => {
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
        handleDelete: jest.fn(),
    }

    const onSubmit = jest.fn()

    const renderComponent = (props: any = {}): RenderResult =>
        render(
            <BrowserRouter>
                <VoiceIntegrationPreferencesForm {...props} />
            </BrowserRouter>
        )

    beforeEach(() => {
        getNewPhoneNumberMock.mockReturnValue((() => phoneIntegration) as any)
        useFormContextMock.mockReturnValue(methodsMock)
        useDeleteVoiceIntegrationMock.mockReturnValue(
            useDeleteVoiceIntegrationReturnValue
        )
        useFormSubmitMock.mockReturnValue({onSubmit})
        FormFieldMock.mockReturnValue(<div>FormField</div>)
        UnsavedChangesPromptMock.mockReturnValue(
            <div>UnsavedChangesPrompt</div>
        )
        FormSubmitButtonMock.mockReturnValue(<div>FormSubmitButton</div>)
        VoiceIntegrationPreferencesInboundCallsMock.mockReturnValue(
            <div>InboundCallsPreferences</div>
        )
        VoiceIntegrationPreferencesTranscriptionMock.mockReturnValue(
            <div>TranscriptionPreferences</div>
        )
        VoiceIntegrationPreferencesCallRecordingsMock.mockReturnValue(
            <div>CallRecordingPreferences</div>
        )
    })

    it('should render the component', () => {
        renderComponent(props)

        expect(screen.getByText('App title')).toBeInTheDocument()
        expect(screen.getByText('InboundCallsPreferences')).toBeInTheDocument()
        expect(screen.getByText('TranscriptionPreferences')).toBeInTheDocument()
        expect(screen.getByText('CallRecordingPreferences')).toBeInTheDocument()

        expect(screen.getByText('Manage Phone Number')).toBeInTheDocument()
    })

    describe('submit button', () => {
        it('should display the submit button as disabled when isValid is false', () => {
            methodsMock.formState.isValid = false
            methodsMock.formState.isDirty = true

            renderComponent(props)

            expect(FormSubmitButtonMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isDisabled: true,
                }),
                {}
            )
        })

        it('should display the submit button as enabled when isValid is true and isDirty is true', () => {
            methodsMock.formState.isValid = true
            methodsMock.formState.isDirty = true

            renderComponent(props)

            expect(FormSubmitButtonMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isDisabled: false,
                }),
                {}
            )
        })
    })

    it('should display delete warning message and it should not contain text about "saved filters"', () => {
        const {getByText, getByRole} = renderComponent(props)

        fireEvent.click(getByRole('button', {name: /Delete integration/i}))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
        ).toBeInTheDocument()
    })

    it('should pass correct props to Title field', () => {
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
            {}
        )
    })

    it('should not display UnsavedChangesPrompt when form is not dirty', () => {
        methodsMock.formState.isDirty = false

        renderComponent(props)

        expect(UnsavedChangesPromptMock).toHaveBeenLastCalledWith(
            expect.objectContaining({when: false}),
            {}
        )
    })

    it('should display UnsavedChangesPrompt when form is dirty', () => {
        methodsMock.formState.isDirty = true

        renderComponent(props)

        expect(UnsavedChangesPromptMock).toHaveBeenLastCalledWith(
            expect.objectContaining({when: true}),
            {}
        )
    })
})
