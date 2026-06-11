import { Form, FormField } from '@repo/forms'
import { assumeMock, render } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { PhoneIntegration } from '@gorgias/helpdesk-queries'

import { integrationsState } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import usePhoneNumbers from 'pages/integrations/integration/components/phone/usePhoneNumbers'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'
import VoiceIntegrationSettingsForm from '../VoiceIntegrationSettingsForm'

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('pages/integrations/integration/components/phone/usePhoneNumbers')
jest.mock('../useVoiceSettingsForm')

const usePhoneNumbersMock = assumeMock(usePhoneNumbers)
const useFormSubmitMock = assumeMock(useFormSubmit)
const useDeleteVoiceIntegrationMock = assumeMock(useDeletePhoneIntegration)

jest.mock('../VoiceIntegrationSettingsFormGeneralSection', () => () => (
    <FormField name="name" isRequired>
        {(field) => (
            <input
                aria-label="Integration name"
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
            />
        )}
    </FormField>
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
jest.mock(
    './../VoiceMessageTTS/TextToSpeechProvider',
    () =>
        ({ children }: { children: React.ReactNode }) => <>{children}</>,
)
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

    const useDeleteVoiceIntegrationReturnValue = {
        isDeleting: false,
        performDelete: jest.fn(),
    }

    const onSubmit = jest.fn()

    const renderComponent = (componentProps: {
        integration: PhoneIntegration
    }): RenderResult =>
        render(
            <Form
                defaultValues={{ name: componentProps.integration.name }}
                onValidSubmit={jest.fn()}
            >
                <VoiceIntegrationSettingsForm {...componentProps} />
            </Form>,
        )

    beforeEach(() => {
        usePhoneNumbersMock.mockReturnValue({
            phoneNumbers: {},
            getPhoneNumberById: jest.fn(),
            getCountryFromPhoneNumberId: jest.fn(() => 'US'),
        })
        useDeleteVoiceIntegrationMock.mockReturnValue(
            useDeleteVoiceIntegrationReturnValue,
        )
        useFormSubmitMock.mockReturnValue({ onSubmit })
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
        it('should display delete warning message and it should not contain text about "saved filters"', async () => {
            const user = userEvent.setup()
            renderComponent(props)

            await user.click(
                screen.getByRole('button', { name: /Delete integration/i }),
            )

            expect(
                screen.getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
            ).toBeInTheDocument()
        })

        it('should render the integration name field with its current value', () => {
            renderComponent(props)

            expect(screen.getByLabelText('Integration name')).toHaveValue(
                props.integration.name,
            )
        })

        it('should keep the edited value after typing into the name field', async () => {
            const user = userEvent.setup()
            renderComponent(props)

            const nameInput = screen.getByLabelText('Integration name')
            await user.clear(nameInput)
            await user.type(nameInput, 'Updated name')

            expect(nameInput).toHaveValue('Updated name')
        })
    })
})
