import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {PhoneFunction, PhoneCountry} from 'business/twilio'
import {
    PhoneIntegration,
    IntegrationType,
    VoiceMessageType,
    PhoneRingingBehaviour,
} from 'models/integration/types'
import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneIntegrationBreadcrumbs from '../PhoneIntegrationBreadcrumbs'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneIntegrationBreadcrumbs/>', () => {
    const integration: PhoneIntegration = {
        id: 1,
        name: 'My Phone Integration',
        decoration: null,
        description: '',
        http: null,
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
            function: PhoneFunction.Standard,
            country: PhoneCountry.US,
            twilio_phone_number_id: 1,
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
    }

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneIntegrationBreadcrumbs integration={integration} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
