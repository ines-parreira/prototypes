import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import PhoneIntegrationVoicemail from '../PhoneIntegrationVoicemail'

describe('<PhoneIntegrationVoicemail/>', () => {
    let updateOrCreateIntegration: jest.MockedFunction<any>
    let integration: Map<string, any>

    beforeEach(() => {
        updateOrCreateIntegration = jest.fn()

        integration = fromJS({
            id: 1,
            name: 'Fake phone integration',
            meta: {
                emoji: '🍏',
                twilio: {
                    incoming_phone_number: {
                        friendly_name: '(415) 111-2222',
                    },
                },
            },
        })
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <PhoneIntegrationVoicemail
                    integration={integration}
                    actions={{updateOrCreateIntegration}}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
