import { assumeMock } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { BrowserRouter } from 'react-router-dom'

import { FormField, FormSubmitButton } from 'core/forms'
import { integrationsState } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { PhoneIntegration } from 'models/integration/types'
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

jest.mock('hooks/useAppSelector')
jest.mock('state/entities/phoneNumbers/selectors')
jest.mock('../useVoiceSettingsForm')

const useAppSelectorMock = assumeMock(useAppSelector)
const useFormSubmitMock = assumeMock(useFormSubmit)

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
jest.mock('../VoiceIntegrationSettingCallRecording', () => () => (
    <div>VoiceIntegrationSettingCallRecording</div>
))
jest.mock('../VoiceIntegrationSettingCallTranscription', () => () => (
    <div>VoiceIntegrationSettingCallTranscription</div>
))
jest.mock('@gorgias/realtime')

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
        useAppSelectorMock.mockReturnValue({
            id: 1,
            phone_number_friendly: '+1 (500) 500-5005',
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
