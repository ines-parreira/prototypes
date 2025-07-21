import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PhoneCountry, PhoneFunction } from 'business/twilio'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import VoiceIntegrationVoicemail from '../VoiceIntegrationVoicemail'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('models/api/resources')

const ivrIntegration: PhoneIntegration = {
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
        type: '',
        emoji: '☎️',
        area_code: '880',
        function: PhoneFunction.Ivr,
        country: PhoneCountry.US,
        phone_number_id: 1,
        preferences: {
            record_inbound_calls: false,
            record_outbound_calls: false,
            voicemail_outside_business_hours: false,
            ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        },
        greeting_message: {
            voice_message_type: VoiceMessageType.None,
        },
        voicemail: {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
        },
    },
    managed: false,
}

const renderVoiceIntegrationVoicemail = (
    storeState: RootState,
    integration: PhoneIntegration,
) =>
    renderWithRouter(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(storeState)}>
                <VoiceIntegrationVoicemail integration={integration} />
            </Provider>
        </QueryClientProvider>,
    )

describe('<VoiceIntegrationVoicemail /> render', () => {
    it('should render IVR integration', () => {
        const { getByLabelText, getByText, getByRole } =
            renderVoiceIntegrationVoicemail({} as RootState, ivrIntegration)

        expect(getByText('Custom recording')).toBeInTheDocument()
        expect(getByText('Text-to-speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'When unchecked, the voicemail recording will play but the caller will not be able to leave a message.',
            ),
        ).toBeInTheDocument()
        expect(getByRole('button', { name: 'Save changes' })).toBeAriaDisabled()
    })

    it('should not render anything if the integration is not a phone integration', () => {
        const { container } = renderVoiceIntegrationVoicemail(
            {} as RootState,
            { ...ivrIntegration, type: IntegrationType.Email } as any,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
