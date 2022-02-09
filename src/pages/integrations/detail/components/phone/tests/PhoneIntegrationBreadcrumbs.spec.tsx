import React from 'react'
import {render} from '@testing-library/react'

import {PhoneFunction, PhoneCountry} from '../../../../../../business/twilio'
import {
    PhoneIntegration,
    IntegrationType,
    VoiceMessageType,
} from '../../../../../../models/integration/types'
import PhoneIntegrationBreadcrumbs from '../PhoneIntegrationBreadcrumbs'

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
            twilio_phone_number_id: 123,
            twilio: {
                incoming_phone_number: {
                    sid: '123',
                    friendly_name: '+123123123',
                    phone_number: '+123123123',
                    deleted_datetime: null,
                },
            },
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
                voicemail_outside_business_hours: false,
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
                <PhoneIntegrationBreadcrumbs integration={integration} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
