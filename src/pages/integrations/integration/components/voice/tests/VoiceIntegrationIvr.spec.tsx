import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import userEvent from '@testing-library/user-event'
import {Router} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    IntegrationType,
    IvrMenuActionType,
    PhoneIntegration,
    VoiceMessageType,
} from 'models/integration/types'
import history from 'pages/history'

import VoiceIntegrationIvr from '../VoiceIntegrationIvr'

const mockStore = configureMockStore([thunk])
jest.mock(
    'pages/integrations/integration/components/voice/IvrMenuActionsFieldArray',
    () => () => <div>test actions</div>
)

const ivrIntegration = {
    id: 1,
    name: 'My Phone Integration',
    decoration: null,
    description: '',
    mappings: null,
    uri: '',
    created_datetime: '1970-01-01T18:00:00',
    updated_datetime: '1970-01-01T18:00:00',
    deactivated_datetime: null,
    deleted_datetime: null,
    locked_datetime: null,
    user: {
        id: 1,
    },
    type: IntegrationType.Phone,
    meta: {
        ivr: {
            greeting_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content:
                    'Hello, thanks for calling. 1 for message 2 for forward 3 for message',
            },
            menu_options: [
                {
                    digit: '1',
                    action: IvrMenuActionType.PlayMessage,
                    voice_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content:
                            "You can update greetings and menu options in the integration's IVR settings page.",
                    },
                },
            ],
        },
    },
} as PhoneIntegration

describe('<VoiceIntegrationIvr />', () => {
    const renderComponent = () => {
        return render(
            <Router history={history}>
                <Provider store={mockStore()}>
                    <VoiceIntegrationIvr integration={ivrIntegration} />
                </Provider>
            </Router>
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
    })

    it('renders component', () => {
        mockFlags({
            [FeatureFlagKey.DeflectToSMS]: true,
        })

        const {getByText, getByLabelText, getByRole} = renderComponent()

        expect(getByText('Set greeting message')).toBeInTheDocument()
        expect(
            getByText(
                'Callers will be informed of all IVR options through this message, which must be updated if options change.'
            )
        ).toBeInTheDocument()
        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(
            getByText(
                'Hello, thanks for calling. 1 for message 2 for forward 3 for message'
            )
        ).toBeInTheDocument()

        expect(getByText('test actions')).toBeInTheDocument()
        expect(getByText('Save changes')).toBeInTheDocument()
        expect(getByRole('button', {name: 'Save changes'})).toHaveAttribute(
            'aria-disabled',
            'true'
        )
        expect(getByText('Cancel')).toBeInTheDocument()
    })

    it('enables save button when there are changes', () => {
        mockFlags({
            [FeatureFlagKey.DeflectToSMS]: true,
        })

        const {getByText, getByLabelText, getByRole} = renderComponent()

        userEvent.click(getByLabelText('None'))
        expect(getByRole('button', {name: 'Save changes'})).toHaveAttribute(
            'aria-disabled',
            'false'
        )

        userEvent.click(getByText('Cancel'))
        expect(getByText('None')).not.toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('renders component with FF off', () => {
        mockFlags({
            [FeatureFlagKey.DeflectToSMS]: false,
        })

        const {getByText, getByLabelText, getByRole} = renderComponent()

        expect(getByText('Greeting message')).toBeInTheDocument()
        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(
            getByText(
                'Hello, thanks for calling. 1 for message 2 for forward 3 for message'
            )
        ).toBeInTheDocument()

        expect(getByText('test actions')).toBeInTheDocument()
        expect(getByText('Save changes')).toBeInTheDocument()
        expect(getByRole('button', {name: 'Save changes'})).toHaveAttribute(
            'aria-disabled',
            'false'
        )
    })
})
